const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const formatFieldName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())

const formatValidationMessage = (message: string) => {
  const replacements: Array<[RegExp, string]> = [
    [/^Input should be greater than or equal to (.+)$/i, 'must be at least $1'],
    [/^Input should be greater than (.+)$/i, 'must be greater than $1'],
    [/^Input should be less than or equal to (.+)$/i, 'must be at most $1'],
    [/^Input should be less than (.+)$/i, 'must be less than $1'],
    [/^Input should be a valid integer$/i, 'must be a valid whole number'],
    [/^Input should be a valid number$/i, 'must be a valid number'],
    [/^String should have at least (.+)$/i, 'must be at least $1 long'],
    [/^String should have at most (.+)$/i, 'must be at most $1 long'],
    [/^Field required$/i, 'is required'],
  ]

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(message)) {
      return message.replace(pattern, replacement)
    }
  }

  return message
}

const formatApiError = (payload: unknown, status: number) => {
  if (typeof payload === 'string') {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const errorPayload = payload as Record<string, unknown>
    const detail = errorPayload.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') {
            return item
          }

          if (item && typeof item === 'object') {
            const detailItem = item as Record<string, unknown>
            const location = Array.isArray(detailItem.loc) ? detailItem.loc : []
            const fieldName = location.length > 0 ? formatFieldName(String(location[location.length - 1])) : ''
            const message = typeof detailItem.msg === 'string' ? formatValidationMessage(detailItem.msg) : JSON.stringify(item)
            return fieldName ? `${fieldName} ${message}` : message
          }

          return String(item)
        })
        .join('; ')
    }

    if (detail && typeof detail === 'object') {
      return JSON.stringify(detail)
    }

    return JSON.stringify(errorPayload)
  }

  return `HTTP ${status}`
}

export interface Club {
  clubId: number
  clubName: string
  stadiumName: string
  stadiumCapacity: number
  city: string
  country: string
  transferBudget: string
  yearFounded: number
  manager?: string
}

export interface Player {
  personId: number
  firstName: string
  lastName: string
  nationality: string
  email: string
  phoneNumber: string
  primaryPosition: string
  preferredFoot: string
  marketValue: string
  jerseyNumber: number
  height: string
  weight: string
  dateOfBirth: string
}

export interface Agent {
  agentId: number
  firstName: string
  lastName: string
  agencyName?: string
  licenseNumber: string
  commissionRate: string
  email: string
  phoneNumber: string
}

export interface Person {
  personId: number
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  email: string
  phoneNumber: string
}

export interface Sponsor {
  sponsorId: number
  sponsorName: string
  industry: string
  hqCountry: string
  contactEmail: string
  contactPhone: string
  website?: string | null
}

export interface Competition {
  compId: number
  compName: string
  compType: string
  country?: string | null
  prizePool?: string | null
  organizingBody: string
  ranking?: number | null
}

export interface Manager {
  personId: number
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  nationality?: string
  email?: string
  phoneNumber?: string
  clubId?: number | null
  coachingLicense: string
  preferredFormation: string
  yearsOfExperience: number
}

export interface Transfer {
  transferId: number
  personId: number
  buyingClubId: number
  sellingClubId?: number | null
  agentId?: number | null
  transferFee: string
  transferType: string
}

export interface Contract {
  contractId: number
  personId: number
  startDate: string
  endDate: string
  signingDate: string
  contractStatus: string
  clubId?: number
  sponsorId?: number
}

class APIClient {
  private baseUrl: string
  private password?: string | null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setPassword(pw?: string | null) {
    this.password = pw ?? null
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    const url = `${this.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    // Attach API password header when set
    if (this.password) {
      ;(options.headers as Record<string, string>)['x-api-password'] = this.password
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      // If request is unauthorized, clear saved password and notify app to re-prompt
      if (response.status === 401) {
        this.password = null
        try {
          window.dispatchEvent(new CustomEvent('fm:auth:invalid'))
        } catch (e) {
          // ignore
        }
      }

      const error = await response.json().catch(() => null)
      throw new Error(formatApiError(error, response.status))
    }

    if (response.status === 204) return null
    return response.json()
  }

  // Clubs
  async getClubs(skip = 0, limit = 100): Promise<Club[]> {
    return this.request('GET', `/clubs?skip=${skip}&limit=${limit}`)
  }

  async getClub(clubId: number): Promise<Club> {
    return this.request('GET', `/clubs/${clubId}`)
  }

  async createClub(club: Omit<Club, 'clubId' | 'manager'>): Promise<Club> {
    return this.request('POST', '/clubs', club)
  }

  async updateClub(clubId: number, updates: Partial<Club>): Promise<Club> {
    return this.request('PATCH', `/clubs/${clubId}`, updates)
  }

  async deleteClub(clubId: number): Promise<void> {
    return this.request('DELETE', `/clubs/${clubId}`)
  }

  // Players
  async getPlayers(skip = 0, limit = 100, clubId?: number): Promise<Player[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (clubId) params.append('club_id', String(clubId))
    return this.request('GET', `/players?${params}`)
  }

  async getPlayer(playerId: number): Promise<Player> {
    return this.request('GET', `/players/${playerId}`)
  }

  async createPlayer(
    player: Omit<Player, 'personId'> & { clubId?: number }
  ): Promise<Player> {
    return this.request('POST', '/players', player)
  }

  async updatePlayer(playerId: number, updates: Partial<Player>): Promise<Player> {
    return this.request('PATCH', `/players/${playerId}`, updates)
  }

  async deletePlayer(playerId: number): Promise<void> {
    return this.request('DELETE', `/players/${playerId}`)
  }

  // Agents
  async getAgents(skip = 0, limit = 100): Promise<Agent[]> {
    return this.request('GET', `/agents?skip=${skip}&limit=${limit}`)
  }

  async getAgent(agentId: number): Promise<Agent> {
    return this.request('GET', `/agents/${agentId}`)
  }

  async createAgent(agent: Omit<Agent, 'agentId'>): Promise<Agent> {
    return this.request('POST', '/agents', agent)
  }

  async updateAgent(agentId: number, updates: Partial<Agent>): Promise<Agent> {
    return this.request('PATCH', `/agents/${agentId}`, updates)
  }

  async deleteAgent(agentId: number): Promise<void> {
    return this.request('DELETE', `/agents/${agentId}`)
  }

  async deleteSponsor(sponsorId: number): Promise<void> {
    return this.request('DELETE', `/sponsors/${sponsorId}`)
  }

  async deleteCompetition(compId: number): Promise<void> {
    return this.request('DELETE', `/competitions/${compId}`)
  }

  async deleteManager(managerId: number): Promise<void> {
    return this.request('DELETE', `/managers/${managerId}`)
  }

  // Persons
  async getPersons(skip = 0, limit = 100): Promise<Person[]> {
    return this.request('GET', `/persons?skip=${skip}&limit=${limit}`)
  }

  // Managers
  async getManagers(skip = 0, limit = 100): Promise<Manager[]> {
    return this.request('GET', `/managers?skip=${skip}&limit=${limit}`)
  }

  async updateManager(managerId: number, updates: Partial<Manager>): Promise<Manager> {
    return this.request('PATCH', `/managers/${managerId}`, updates)
  }

  // Sponsors
  async getSponsors(skip = 0, limit = 100): Promise<Sponsor[]> {
    return this.request('GET', `/sponsors?skip=${skip}&limit=${limit}`)
  }

  async updateSponsor(sponsorId: number, updates: Partial<Sponsor>): Promise<Sponsor> {
    return this.request('PATCH', `/sponsors/${sponsorId}`, updates)
  }

  // Competitions
  async getCompetitions(skip = 0, limit = 100): Promise<Competition[]> {
    return this.request('GET', `/competitions?skip=${skip}&limit=${limit}`)
  }

  async updateCompetition(
    compId: number,
    updates: {
      compName?: string
      compType?: Competition['compType']
      country?: string | null
      prizePool?: number | string | null
      organizingBody?: string
      ranking?: number | null
    },
  ): Promise<Competition> {
    return this.request('PATCH', `/competitions/${compId}`, updates)
  }

  // Contracts
  async getContracts(skip = 0, limit = 100): Promise<Contract[]> {
    return this.request('GET', `/contracts?skip=${skip}&limit=${limit}`)
  }

  async updateContract(contractId: number, updates: Partial<Contract>): Promise<Contract> {
    return this.request('PATCH', `/contracts/${contractId}`, updates)
  }

  async deleteContract(contractId: number): Promise<void> {
    return this.request('DELETE', `/contracts/${contractId}`)
  }

  // Transfers
  async getTransfers(skip = 0, limit = 100): Promise<Transfer[]> {
    return this.request('GET', `/transfers?skip=${skip}&limit=${limit}`)
  }

  async updateTransfer(
    transferId: number,
    updates: {
      personId?: number
      buyingClubId?: number
      sellingClubId?: number | null
      agentId?: number | null
      transferFee?: number | string
      transferType?: Transfer['transferType']
    },
  ): Promise<Transfer> {
    return this.request('PATCH', `/transfers/${transferId}`, updates)
  }

  async deleteTransfer(transferId: number): Promise<void> {
    return this.request('DELETE', `/transfers/${transferId}`)
  }

  // Contracts
  async createEmploymentContract(contract: {
    personId: number
    clubId: number
    startDate: string
    endDate: string
    signingDate: string
    contractStatus: 'Active' | 'Expired' | 'Terminated'
    weeklySalary: number
    releaseClause?: number
    signingBonus?: number
    performanceBonus?: number
  }): Promise<unknown> {
    return this.request('POST', '/contracts/employment', contract)
  }

  // Transfers
  async createTransfer(transfer: {
    personId: number
    buyingClubId: number
    sellingClubId?: number
    agentId?: number
    transferFee: number
    transferType: 'Permanent' | 'Loan' | 'Free'
  }): Promise<unknown> {
    return this.request('POST', '/transfers', transfer)
  }
}

export const apiClient = new APIClient()
