import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  apiClient,
  type Club,
  type Player,
  type Agent,
  type Sponsor,
  type Competition,
  type Manager,
  type Contract,
  type Transfer,
} from './api/client'
import { UserRound, UserCog, Shield, Megaphone } from 'lucide-react'

type Page = 'home' | 'clubs' | 'players' | 'agents' | 'sponsors' | 'competitions' | 'managers' | 'contracts' | 'transfers'

type SwipeDirection = 'left' | 'right' | null

type EditableEntityItem = {
  title: string
  lines: string[]
  onEdit?: () => void
}

function App() {
  const [activePage, setActivePage] = useState<Page>('home')
  const [clubs, setClubs] = useState<Club[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [clubIndex, setClubIndex] = useState(0)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [notice, setNotice] = useState('Loading data from server...')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false)
  const [showAddClubForm, setShowAddClubForm] = useState(false)
  const [showAddAgentForm, setShowAddAgentForm] = useState(false)
  const [showSignContractForm, setShowSignContractForm] = useState(false)
  const [showEditClubForm, setShowEditClubForm] = useState(false)
  const [showEditPlayerForm, setShowEditPlayerForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [editingManager, setEditingManager] = useState<Manager | null>(null)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clubSwipeDirection, setClubSwipeDirection] = useState<SwipeDirection>(null)
  const [playerSwipeDirection, setPlayerSwipeDirection] = useState<SwipeDirection>(null)

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          clubsData,
          playersData,
          agentsData,
          sponsorsData,
          competitionsData,
          managersData,
          contractsData,
          transfersData,
        ] = await Promise.all([
          apiClient.getClubs(),
          apiClient.getPlayers(),
          apiClient.getAgents(),
          apiClient.getSponsors(),
          apiClient.getCompetitions(),
          apiClient.getManagers(),
          apiClient.getContracts(),
          apiClient.getTransfers(),
        ])
        setClubs(clubsData)
        setPlayers(playersData)
        setAgents(agentsData)
        setSponsors(sponsorsData)
        setCompetitions(competitionsData)
        setManagers(managersData)
        setContracts(contractsData)
        setTransfers(transfersData)
        setNotice('Database synced successfully')
      } catch (error) {
        setNotice(`Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const selectedClub = clubs.length > 0 ? clubs[clubIndex] : null
  const selectedPlayer = players.length > 0 ? players[playerIndex] : null

  const databaseSummary = useMemo(
    () => [
      { label: 'Clubs', count: clubs.length, detail: 'Club records' },
      { label: 'Players', count: players.length, detail: 'Player records' },
      { label: 'Agents', count: agents.length, detail: 'Agent records' },
      { label: 'Sponsors', count: sponsors.length, detail: 'Sponsor records' },
      { label: 'Competitions', count: competitions.length, detail: 'Competition records' },
      { label: 'Managers', count: managers.length, detail: 'Manager records' },
      { label: 'Contracts', count: contracts.length, detail: 'Contract records' },
      { label: 'Transfers', count: transfers.length, detail: 'Transfer records' },
    ],
    [agents, clubs, competitions, contracts, managers, players, sponsors, transfers],
  )

  const showNotice = (message: string) => {
    setNotice(message)
  }

  const refreshData = async () => {
    const [
      clubsData,
      playersData,
      agentsData,
      sponsorsData,
      competitionsData,
      managersData,
      contractsData,
      transfersData,
    ] = await Promise.all([
      apiClient.getClubs(),
      apiClient.getPlayers(),
      apiClient.getAgents(),
      apiClient.getSponsors(),
      apiClient.getCompetitions(),
      apiClient.getManagers(),
      apiClient.getContracts(),
      apiClient.getTransfers(),
    ])
    setClubs(clubsData)
    setPlayers(playersData)
    setAgents(agentsData)
    setSponsors(sponsorsData)
    setCompetitions(competitionsData)
    setManagers(managersData)
    setContracts(contractsData)
    setTransfers(transfersData)
  }

  const animateSwipe = (setter: (value: SwipeDirection) => void, direction: SwipeDirection) => {
    setter(direction)
    window.setTimeout(() => setter(null), 260)
  }

  const moveClub = (direction: 'next' | 'prev') => {
    if (clubs.length === 0) return
    animateSwipe(setClubSwipeDirection, direction === 'next' ? 'left' : 'right')
    setClubIndex((current) => {
      if (direction === 'next') {
        return (current + 1) % clubs.length
      }
      return (current - 1 + clubs.length) % clubs.length
    })
  }

  const movePlayer = (direction: 'next' | 'prev') => {
    if (players.length === 0) return
    animateSwipe(setPlayerSwipeDirection, direction === 'next' ? 'left' : 'right')
    setPlayerIndex((current) => {
      if (direction === 'next') {
        return (current + 1) % players.length
      }
      return (current - 1 + players.length) % players.length
    })
  }

  const onSwipe = (
    event: React.TouchEvent<HTMLElement>,
    onNext: () => void,
    onPrev: () => void,
  ) => {
    const touchX = event.changedTouches[0].clientX
    const startX = Number(event.currentTarget.dataset.touchStart ?? touchX)
    const distance = touchX - startX

    if (distance < -40) {
      onNext()
    }

    if (distance > 40) {
      onPrev()
    }
  }

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const newPlayer = await apiClient.createPlayer({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        nationality: formData.get('nationality') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        primaryPosition: formData.get('primaryPosition') as any,
        preferredFoot: formData.get('preferredFoot') as any,
        marketValue: formData.get('marketValue') as string,
        jerseyNumber: parseInt(formData.get('jerseyNumber') as string),
        height: formData.get('height') as string,
        weight: formData.get('weight') as string,
      })
      setPlayers([...players, newPlayer])
      showNotice(`Player ${newPlayer.firstName} ${newPlayer.lastName} added successfully!`)
      setShowAddPlayerForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error adding player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const newClub = await apiClient.createClub({
        clubName: formData.get('clubName') as string,
        stadiumName: formData.get('stadiumName') as string,
        stadiumCapacity: parseInt(formData.get('stadiumCapacity') as string),
        city: formData.get('city') as string,
        country: formData.get('country') as string,
        transferBudget: formData.get('transferBudget') as string,
        yearFounded: parseInt(formData.get('yearFounded') as string),
      })
      setClubs([...clubs, newClub])
      showNotice(`Club ${newClub.clubName} added successfully!`)
      setShowAddClubForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error adding club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedClub) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedClub = await apiClient.updateClub(selectedClub.clubId, {
        clubName: formData.get('clubName') as string,
        stadiumName: formData.get('stadiumName') as string,
        stadiumCapacity: parseInt(formData.get('stadiumCapacity') as string),
        city: formData.get('city') as string,
        country: formData.get('country') as string,
        transferBudget: formData.get('transferBudget') as string,
        yearFounded: parseInt(formData.get('yearFounded') as string),
      })
      setClubs((current) => current.map((club) => (club.clubId === updatedClub.clubId ? updatedClub : club)))
      showNotice(`Club ${updatedClub.clubName} updated successfully!`)
      setShowEditClubForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const newAgent = await apiClient.createAgent({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        agencyName: formData.get('agencyName') as string,
        licenseNumber: formData.get('licenseNumber') as string,
        commissionRate: formData.get('commissionRate') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string,
      })
      setAgents([...agents, newAgent])
      showNotice(`Agent ${newAgent.firstName} ${newAgent.lastName} added successfully!`)
      setShowAddAgentForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error adding agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPlayer) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedPlayer = await apiClient.updatePlayer(selectedPlayer.personId, {
        primaryPosition: formData.get('primaryPosition') as any,
        preferredFoot: formData.get('preferredFoot') as any,
        marketValue: formData.get('marketValue') as string,
        jerseyNumber: parseInt(formData.get('jerseyNumber') as string),
        height: formData.get('height') as string,
        weight: formData.get('weight') as string,
      })
      setPlayers((current) => current.map((player) => (player.personId === updatedPlayer.personId ? updatedPlayer : player)))
      showNotice(`Player ${updatedPlayer.firstName} ${updatedPlayer.lastName} updated successfully!`)
      setShowEditPlayerForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAgent) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedAgent = await apiClient.updateAgent(editingAgent.agentId, {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        agencyName: formData.get('agencyName') as string,
        licenseNumber: formData.get('licenseNumber') as string,
        commissionRate: formData.get('commissionRate') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phoneNumber') as string,
      })
      setAgents((current) => current.map((agent) => (agent.agentId === updatedAgent.agentId ? updatedAgent : agent)))
      setEditingAgent(null)
      showNotice(`Agent ${updatedAgent.firstName} ${updatedAgent.lastName} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditSponsor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSponsor) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedSponsor = await apiClient.updateSponsor(editingSponsor.sponsorId, {
        sponsorName: formData.get('sponsorName') as string,
        industry: formData.get('industry') as string,
        hqCountry: formData.get('hqCountry') as string,
        contactEmail: formData.get('contactEmail') as string,
        contactPhone: formData.get('contactPhone') as string,
        website: formData.get('website') as string,
      })
      setSponsors((current) => current.map((sponsor) => (sponsor.sponsorId === updatedSponsor.sponsorId ? updatedSponsor : sponsor)))
      setEditingSponsor(null)
      showNotice(`Sponsor ${updatedSponsor.sponsorName} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating sponsor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditCompetition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCompetition) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedCompetition = await apiClient.updateCompetition(editingCompetition.compId, {
        compName: formData.get('compName') as string,
        compType: formData.get('compType') as any,
        country: formData.get('country') as string,
        prizePool: formData.get('prizePool') ? parseFloat(formData.get('prizePool') as string) : undefined,
        organizingBody: formData.get('organizingBody') as string,
        ranking: formData.get('ranking') ? parseInt(formData.get('ranking') as string) : undefined,
      } as any)
      setCompetitions((current) => current.map((competition) => (competition.compId === updatedCompetition.compId ? updatedCompetition : competition)))
      setEditingCompetition(null)
      showNotice(`Competition ${updatedCompetition.compName} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating competition: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingManager) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedManager = await apiClient.updateManager(editingManager.personId, {
        coachingLicense: formData.get('coachingLicense') as string,
        preferredFormation: formData.get('preferredFormation') as string,
        yearsOfExperience: parseInt(formData.get('yearsOfExperience') as string),
        clubId: formData.get('clubId') ? parseInt(formData.get('clubId') as string) : undefined,
      })
      setManagers((current) => current.map((manager) => (manager.personId === updatedManager.personId ? updatedManager : manager)))
      setEditingManager(null)
      showNotice(`Manager ${updatedManager.firstName} ${updatedManager.lastName} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating manager: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingContract) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedContract = await apiClient.updateContract(editingContract.contractId, {
        contractStatus: formData.get('contractStatus') as any,
      })
      setContracts((current) => current.map((contract) => (contract.contractId === updatedContract.contractId ? updatedContract : contract)))
      setEditingContract(null)
      showNotice(`Contract #${updatedContract.contractId} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating contract: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTransfer) return

    const formData = new FormData(e.currentTarget)
    try {
      const updatedTransfer = await apiClient.updateTransfer(editingTransfer.transferId, {
        personId: parseInt(formData.get('personId') as string),
        buyingClubId: parseInt(formData.get('buyingClubId') as string),
        sellingClubId: formData.get('sellingClubId') ? parseInt(formData.get('sellingClubId') as string) : undefined,
        agentId: formData.get('agentId') ? parseInt(formData.get('agentId') as string) : undefined,
        transferFee: parseFloat(formData.get('transferFee') as string),
        transferType: formData.get('transferType') as any,
      } as any)
      setTransfers((current) => current.map((transfer) => (transfer.transferId === updatedTransfer.transferId ? updatedTransfer : transfer)))
      setEditingTransfer(null)
      showNotice(`Transfer #${updatedTransfer.transferId} updated successfully!`)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error updating transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteClub = async () => {
    if (!selectedClub || deleting) return
    const confirmed = window.confirm(`Delete club ${selectedClub.clubName}?`)
    if (!confirmed) return

    try {
      setDeleting('club')
      await apiClient.deleteClub(selectedClub.clubId)
      setNotice(`Club ${selectedClub.clubName} deleted successfully.`)
      setShowEditClubForm(false)
      await refreshData()
      setClubIndex((current) => Math.max(0, Math.min(current, Math.max(0, clubs.length - 2))))
    } catch (error) {
      showNotice(`Error deleting club: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deletePlayer = async () => {
    if (!selectedPlayer || deleting) return
    const confirmed = window.confirm(`Delete player ${selectedPlayer.firstName} ${selectedPlayer.lastName}?`)
    if (!confirmed) return

    try {
      setDeleting('player')
      await apiClient.deletePlayer(selectedPlayer.personId)
      setNotice(`Player ${selectedPlayer.firstName} ${selectedPlayer.lastName} deleted successfully.`)
      setShowEditPlayerForm(false)
      await refreshData()
      setPlayerIndex((current) => Math.max(0, Math.min(current, Math.max(0, players.length - 2))))
    } catch (error) {
      showNotice(`Error deleting player: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteAgent = async () => {
    if (!editingAgent || deleting) return
    const confirmed = window.confirm(`Delete agent ${editingAgent.firstName} ${editingAgent.lastName}?`)
    if (!confirmed) return

    try {
      setDeleting('agent')
      await apiClient.deleteAgent(editingAgent.agentId)
      showNotice(`Agent ${editingAgent.firstName} ${editingAgent.lastName} deleted successfully.`)
      setEditingAgent(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteSponsor = async () => {
    if (!editingSponsor || deleting) return
    const confirmed = window.confirm(`Delete sponsor ${editingSponsor.sponsorName}?`)
    if (!confirmed) return

    try {
      setDeleting('sponsor')
      await apiClient.deleteSponsor(editingSponsor.sponsorId)
      showNotice(`Sponsor ${editingSponsor.sponsorName} deleted successfully.`)
      setEditingSponsor(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting sponsor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteCompetition = async () => {
    if (!editingCompetition || deleting) return
    const confirmed = window.confirm(`Delete competition ${editingCompetition.compName}?`)
    if (!confirmed) return

    try {
      setDeleting('competition')
      await apiClient.deleteCompetition(editingCompetition.compId)
      showNotice(`Competition ${editingCompetition.compName} deleted successfully.`)
      setEditingCompetition(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting competition: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteManager = async () => {
    if (!editingManager || deleting) return
    const confirmed = window.confirm(`Delete manager ${editingManager.firstName ?? ''} ${editingManager.lastName ?? ''}?`)
    if (!confirmed) return

    try {
      setDeleting('manager')
      await apiClient.deleteManager(editingManager.personId)
      showNotice(`Manager deleted successfully.`)
      setEditingManager(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting manager: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteContract = async () => {
    if (!editingContract || deleting) return
    const confirmed = window.confirm(`Delete contract #${editingContract.contractId}?`)
    if (!confirmed) return

    try {
      setDeleting('contract')
      await apiClient.deleteContract(editingContract.contractId)
      showNotice(`Contract #${editingContract.contractId} deleted successfully.`)
      setEditingContract(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting contract: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const deleteTransfer = async () => {
    if (!editingTransfer || deleting) return
    const confirmed = window.confirm(`Delete transfer #${editingTransfer.transferId}?`)
    if (!confirmed) return

    try {
      setDeleting('transfer')
      await apiClient.deleteTransfer(editingTransfer.transferId)
      showNotice(`Transfer #${editingTransfer.transferId} deleted successfully.`)
      setEditingTransfer(null)
      await refreshData()
    } catch (error) {
      showNotice(`Error deleting transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleSignContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await apiClient.createEmploymentContract({
        personId: parseInt(formData.get('personId') as string),
        clubId: parseInt(formData.get('clubId') as string),
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        signingDate: formData.get('signingDate') as string,
        contractStatus: 'Active',
        weeklySalary: parseFloat(formData.get('weeklySalary') as string),
        releaseClause: formData.get('releaseClause') ? parseFloat(formData.get('releaseClause') as string) : undefined,
      })
      showNotice('Employment contract signed successfully!')
      setShowSignContractForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      showNotice(`Error signing contract: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const homeActions = [
    { label: 'Add Player', icon: <UserRound size={22} strokeWidth={2.25} /> },
    { label: 'Add Agent', icon: <UserCog size={22} strokeWidth={2.25} /> },
    { label: 'Add Club', icon: <Shield size={22} strokeWidth={2.25} /> },
    { label: 'Sign Contract', icon: <Megaphone size={22} strokeWidth={2.25} /> },
  ] as const

  return (
    <div className="app-shell">
      <header className="hero-header">
        <p className="eyebrow">Football Management System</p>
        <h1>League Control Room</h1>
        <p className="subtitle">
          Manage clubs, players, agents, and contracts.
        </p>
        <nav className="page-tabs" aria-label="Main sections">
          {(['home', 'clubs', 'players', 'agents', 'sponsors', 'competitions', 'managers', 'contracts', 'transfers'] as const).map((page) => (
            <button
              key={page}
              type="button"
              className={`tab-btn ${activePage === page ? 'active' : ''}`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>
      </header>

      {activePage === 'home' && (
        <section className="panel home-panel">
          <div className="home-grid">
            {homeActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="squircle-btn"
                onClick={() => {
                  if (action.label === 'Add Player') setShowAddPlayerForm(true)
                  if (action.label === 'Add Agent') setShowAddAgentForm(true)
                  if (action.label === 'Add Club') setShowAddClubForm(true)
                  if (action.label === 'Sign Contract') setShowSignContractForm(true)
                }}
              >
                <span className="squircle-icon">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
          <div className="notice-card" role="status" aria-live="polite">
            {notice}
          </div>

          <section className="database-summary" aria-label="Database summary">
            <div className="summary-header">
              <div>
                <p className="summary-eyebrow">Database Snapshot</p>
                <h3>Loaded records by table</h3>
              </div>
              <span className="summary-pill">Live</span>
            </div>

            <div className="summary-grid">
              {databaseSummary.map((item) => (
                <article key={item.label} className={`summary-card ${item.count === 0 ? 'is-empty' : 'is-ready'}`}>
                  <div className="summary-card-top">
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <p>{item.count === 0 ? 'No records yet' : item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Add Player Form */}
          {showAddPlayerForm && (
            <div style={modalStyles.overlay} onClick={() => setShowAddPlayerForm(false)}>
              <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Add New Player</h3>
                <form onSubmit={handleAddPlayer} style={formStyles.form}>
                  <input required type="text" name="firstName" placeholder="First Name" />
                  <input required type="text" name="lastName" placeholder="Last Name" />
                  <input required type="date" name="dateOfBirth" />
                  <input required type="text" name="nationality" placeholder="Nationality" />
                  <input required type="email" name="email" placeholder="Email" />
                  <input required type="tel" name="phoneNumber" placeholder="Phone Number" />
                  <select required name="primaryPosition">
                    <option value="">Select Position</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FWD">Forward</option>
                  </select>
                  <select required name="preferredFoot">
                    <option value="">Preferred Foot</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Both">Both</option>
                  </select>
                  <input required type="number" step="0.01" name="marketValue" placeholder="Market Value" />
                  <input required type="number" name="jerseyNumber" placeholder="Jersey Number" min="1" max="99" />
                  <input required type="number" step="0.01" name="height" placeholder="Height (cm)" />
                  <input required type="number" step="0.01" name="weight" placeholder="Weight (kg)" />
                  <div style={formStyles.buttonGroup}>
                    <button type="submit">Add Player</button>
                    <button type="button" onClick={() => setShowAddPlayerForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Club Form */}
          {showAddClubForm && (
            <div style={modalStyles.overlay} onClick={() => setShowAddClubForm(false)}>
              <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Add New Club</h3>
                <form onSubmit={handleAddClub} style={formStyles.form}>
                  <input required type="text" name="clubName" placeholder="Club Name" />
                  <input required type="text" name="stadiumName" placeholder="Stadium Name" />
                  <input required type="number" name="stadiumCapacity" placeholder="Stadium Capacity" />
                  <input required type="text" name="city" placeholder="City" />
                  <input required type="text" name="country" placeholder="Country" />
                  <input required type="number" step="0.01" name="transferBudget" placeholder="Transfer Budget" />
                  <input required type="number" name="yearFounded" placeholder="Year Founded" />
                  <div style={formStyles.buttonGroup}>
                    <button type="submit">Add Club</button>
                    <button type="button" onClick={() => setShowAddClubForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Agent Form */}
          {showAddAgentForm && (
            <div style={modalStyles.overlay} onClick={() => setShowAddAgentForm(false)}>
              <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Add New Agent</h3>
                <form onSubmit={handleAddAgent} style={formStyles.form}>
                  <input required type="text" name="firstName" placeholder="First Name" />
                  <input required type="text" name="lastName" placeholder="Last Name" />
                  <input type="text" name="agencyName" placeholder="Agency Name (optional)" />
                  <input required type="text" name="licenseNumber" placeholder="License Number" />
                  <input required type="number" step="0.01" name="commissionRate" placeholder="Commission Rate %" />
                  <input required type="email" name="email" placeholder="Email" />
                  <input required type="tel" name="phoneNumber" placeholder="Phone Number" />
                  <div style={formStyles.buttonGroup}>
                    <button type="submit">Add Agent</button>
                    <button type="button" onClick={() => setShowAddAgentForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sign Contract Form */}
          {showSignContractForm && (
            <div style={modalStyles.overlay} onClick={() => setShowSignContractForm(false)}>
              <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Sign Employment Contract</h3>
                <form onSubmit={handleSignContract} style={formStyles.form}>
                  <select required name="personId">
                    <option value="">Select Player</option>
                    {players.map((p) => (
                      <option key={p.personId} value={p.personId}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                  <select required name="clubId">
                    <option value="">Select Club</option>
                    {clubs.map((c) => (
                      <option key={c.clubId} value={c.clubId}>
                        {c.clubName}
                      </option>
                    ))}
                  </select>
                  <input required type="date" name="signingDate" />
                  <label>Start Date:</label>
                  <input required type="date" name="startDate" />
                  <label>End Date:</label>
                  <input required type="date" name="endDate" />
                  <input required type="number" step="0.01" name="weeklySalary" placeholder="Weekly Salary" />
                  <input type="number" step="0.01" name="releaseClause" placeholder="Release Clause (optional)" />
                  <div style={formStyles.buttonGroup}>
                    <button type="submit">Sign Contract</button>
                    <button type="button" onClick={() => setShowSignContractForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {activePage === 'clubs' && (
        <section className="panel clubs-panel">
          <h2>Clubs  ({clubs.length})</h2>

          {!isLoading && selectedClub && (
            <>
              <article
                className={`swipe-card club-card ${clubSwipeDirection ? `swipe-${clubSwipeDirection}` : ''}`}
                onTouchStart={(event) => {
                  event.currentTarget.dataset.touchStart = String(event.changedTouches[0].clientX)
                }}
                onTouchEnd={(event) => onSwipe(event, () => moveClub('next'), () => moveClub('prev'))}
              >
                <div className="entity-identity">
                  <h3>{selectedClub.clubName}</h3>
                  <p>{selectedClub.city}, {selectedClub.country}</p>
                </div>
                <div className="entity-details">
                  <p>Stadium: {selectedClub.stadiumName}</p>
                  <p>Capacity: {selectedClub.stadiumCapacity}</p>
                  <p>Budget: ${selectedClub.transferBudget}M</p>
                  <p>Founded: {selectedClub.yearFounded}</p>
                  <button type="button" className="edit-btn" onClick={() => setShowEditClubForm(true)}>
                    Edit Properties
                  </button>
                </div>
              </article>

              <div className="card-controls">
                <button type="button" onClick={() => moveClub('prev')}>
                  Previous Club
                </button>
                <span>
                  {clubIndex + 1}/{clubs.length}
                </span>
                <button type="button" onClick={() => moveClub('next')}>
                  Next Club
                </button>
              </div>
            </>
          )}

        </section>
      )}

      {activePage === 'players' && (
        <section className="panel players-panel">
          <h2>Players ({players.length})</h2>
          {!isLoading && selectedPlayer && (
            <>
              <article
                className={`swipe-card player-card ${playerSwipeDirection ? `swipe-${playerSwipeDirection}` : ''}`}
                onTouchStart={(event) => {
                  event.currentTarget.dataset.touchStart = String(event.changedTouches[0].clientX)
                }}
                onTouchEnd={(event) => onSwipe(event, () => movePlayer('next'), () => movePlayer('prev'))}
              >
                <div className="entity-identity">
                  <h3>{selectedPlayer.firstName} {selectedPlayer.lastName}</h3>
                  <p>{selectedPlayer.primaryPosition} | #{selectedPlayer.jerseyNumber}</p>
                </div>
                <div className="entity-details">
                  <p>Nationality: {selectedPlayer.nationality}</p>
                  <p>Email: {selectedPlayer.email}</p>
                  <p>Phone: {selectedPlayer.phoneNumber}</p>
                  <p>Value: ${selectedPlayer.marketValue}M</p>
                  <p>Height: {selectedPlayer.height}m</p>
                  <p>Weight: {selectedPlayer.weight}kg</p>
                  <p>Preferred Foot: {selectedPlayer.preferredFoot}</p>
                  <button type="button" className="edit-btn" onClick={() => setShowEditPlayerForm(true)}>
                    Edit Properties
                  </button>
                </div>
              </article>
              <div className="card-controls">
                <button type="button" onClick={() => movePlayer('prev')}>
                  Previous Player
                </button>
                <span>
                  {playerIndex + 1}/{players.length}
                </span>
                <button type="button" onClick={() => movePlayer('next')}>
                  Next Player
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <footer className="app-footer">
        Swipe cards on touch devices or use next/previous controls.
      </footer>

      {activePage === 'agents' && (
        <EntityListPanel
          title={`Agents (${agents.length})`}
          emptyLabel="agent records"
          items={agents.map((agent) => ({
            title: `${agent.firstName} ${agent.lastName}`,
            lines: [
              `${agent.agencyName ?? 'No agency'} · ${agent.licenseNumber}`,
              agent.email,
              agent.phoneNumber,
              `Commission ${agent.commissionRate}%`,
            ],
            onEdit: () => setEditingAgent(agent),
          }))}
        />
      )}
      {activePage === 'sponsors' && (
        <EntityListPanel
          title={`Sponsors (${sponsors.length})`}
          emptyLabel="sponsor records"
          items={sponsors.map((sponsor) => ({
            title: sponsor.sponsorName,
            lines: [sponsor.industry, sponsor.hqCountry, sponsor.contactEmail, sponsor.contactPhone, sponsor.website ?? 'No website'],
            onEdit: () => setEditingSponsor(sponsor),
          }))}
        />
      )}
      {activePage === 'competitions' && (
        <EntityListPanel
          title={`Competitions (${competitions.length})`}
          emptyLabel="competition records"
          items={competitions.map((competition) => ({
            title: competition.compName,
            lines: [competition.compType, competition.country ?? 'No country', competition.organizingBody, competition.prizePool ? `$${competition.prizePool}` : 'No prize pool', competition.ranking ? `Ranking ${competition.ranking}` : 'Unranked'],
            onEdit: () => setEditingCompetition(competition),
          }))}
        />
      )}
      {activePage === 'managers' && (
        <EntityListPanel
          title={`Managers (${managers.length})`}
          emptyLabel="manager records"
          items={managers.map((manager) => ({
            title: manager.firstName && manager.lastName ? `${manager.firstName} ${manager.lastName}` : `Person ${manager.personId}`,
            lines: [manager.coachingLicense, manager.preferredFormation, `Years: ${manager.yearsOfExperience}`, manager.clubId ? `Club ${manager.clubId}` : 'Unassigned'],
            onEdit: () => setEditingManager(manager),
          }))}
        />
      )}
      {activePage === 'contracts' && (
        <EntityListPanel
          title={`Contracts (${contracts.length})`}
          emptyLabel="contract records"
          items={contracts.map((contract) => ({
            title: `Contract #${contract.contractId}`,
            lines: [`Person ${contract.personId}`, `${contract.startDate} → ${contract.endDate}`, contract.contractStatus, contract.clubId ? `Club ${contract.clubId}` : contract.sponsorId ? `Sponsor ${contract.sponsorId}` : 'Base contract'],
            onEdit: () => setEditingContract(contract),
          }))}
        />
      )}
      {activePage === 'transfers' && (
        <EntityListPanel
          title={`Transfers (${transfers.length})`}
          emptyLabel="transfer records"
          items={transfers.map((transfer) => ({
            title: `Transfer #${transfer.transferId}`,
            lines: [
              `Person ${transfer.personId}`,
              `Fee ${transfer.transferFee}`,
              transfer.transferType,
              `Buy ${transfer.buyingClubId}` + (transfer.sellingClubId ? ` · Sell ${transfer.sellingClubId}` : '') + (transfer.agentId ? ` · Agent ${transfer.agentId}` : ''),
            ],
            onEdit: () => setEditingTransfer(transfer),
          }))}
        />
      )}

      {showEditClubForm && selectedClub && (
        <div style={modalStyles.overlay} onClick={() => setShowEditClubForm(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Club Properties</h3>
            <form onSubmit={handleEditClub} style={formStyles.form}>
              <input required type="text" name="clubName" defaultValue={selectedClub.clubName} placeholder="Club Name" />
              <input required type="text" name="stadiumName" defaultValue={selectedClub.stadiumName} placeholder="Stadium Name" />
              <input required type="number" name="stadiumCapacity" defaultValue={selectedClub.stadiumCapacity} placeholder="Stadium Capacity" />
              <input required type="text" name="city" defaultValue={selectedClub.city} placeholder="City" />
              <input required type="text" name="country" defaultValue={selectedClub.country} placeholder="Country" />
              <input required type="number" step="0.01" name="transferBudget" defaultValue={selectedClub.transferBudget} placeholder="Transfer Budget" />
              <input required type="number" name="yearFounded" defaultValue={selectedClub.yearFounded} placeholder="Year Founded" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteClub} disabled={deleting === 'club'}>
                  Delete Club
                </button>
                <button type="button" onClick={() => setShowEditClubForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditPlayerForm && selectedPlayer && (
        <div style={modalStyles.overlay} onClick={() => setShowEditPlayerForm(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Player Properties</h3>
            <form onSubmit={handleEditPlayer} style={formStyles.form}>
              <select required name="primaryPosition" defaultValue={selectedPlayer.primaryPosition}>
                <option value="GK">Goalkeeper</option>
                <option value="DEF">Defender</option>
                <option value="MID">Midfielder</option>
                <option value="FWD">Forward</option>
              </select>
              <select required name="preferredFoot" defaultValue={selectedPlayer.preferredFoot}>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Both">Both</option>
              </select>
              <input required type="number" step="0.01" name="marketValue" defaultValue={selectedPlayer.marketValue} placeholder="Market Value" />
              <input required type="number" name="jerseyNumber" min="1" max="99" defaultValue={selectedPlayer.jerseyNumber} placeholder="Jersey Number" />
              <input required type="number" step="0.01" name="height" defaultValue={selectedPlayer.height} placeholder="Height (cm)" />
              <input required type="number" step="0.01" name="weight" defaultValue={selectedPlayer.weight} placeholder="Weight (kg)" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deletePlayer} disabled={deleting === 'player'}>
                  Delete Player
                </button>
                <button type="button" onClick={() => setShowEditPlayerForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAgent && (
        <div style={modalStyles.overlay} onClick={() => setEditingAgent(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Agent Properties</h3>
            <form onSubmit={handleEditAgent} style={formStyles.form}>
              <input required type="text" name="firstName" defaultValue={editingAgent.firstName} placeholder="First Name" />
              <input required type="text" name="lastName" defaultValue={editingAgent.lastName} placeholder="Last Name" />
              <input type="text" name="agencyName" defaultValue={editingAgent.agencyName ?? ''} placeholder="Agency Name" />
              <input required type="text" name="licenseNumber" defaultValue={editingAgent.licenseNumber} placeholder="License Number" />
              <input required type="number" step="0.01" name="commissionRate" defaultValue={editingAgent.commissionRate} placeholder="Commission Rate %" />
              <input required type="email" name="email" defaultValue={editingAgent.email} placeholder="Email" />
              <input required type="tel" name="phoneNumber" defaultValue={editingAgent.phoneNumber} placeholder="Phone Number" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteAgent} disabled={deleting === 'agent'}>Delete Agent</button>
                <button type="button" onClick={() => setEditingAgent(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSponsor && (
        <div style={modalStyles.overlay} onClick={() => setEditingSponsor(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Sponsor Properties</h3>
            <form onSubmit={handleEditSponsor} style={formStyles.form}>
              <input required type="text" name="sponsorName" defaultValue={editingSponsor.sponsorName} placeholder="Sponsor Name" />
              <input required type="text" name="industry" defaultValue={editingSponsor.industry} placeholder="Industry" />
              <input required type="text" name="hqCountry" defaultValue={editingSponsor.hqCountry} placeholder="HQ Country" />
              <input required type="email" name="contactEmail" defaultValue={editingSponsor.contactEmail} placeholder="Contact Email" />
              <input required type="tel" name="contactPhone" defaultValue={editingSponsor.contactPhone} placeholder="Contact Phone" />
              <input type="url" name="website" defaultValue={editingSponsor.website ?? ''} placeholder="Website" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteSponsor} disabled={deleting === 'sponsor'}>Delete Sponsor</button>
                <button type="button" onClick={() => setEditingSponsor(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCompetition && (
        <div style={modalStyles.overlay} onClick={() => setEditingCompetition(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Competition Properties</h3>
            <form onSubmit={handleEditCompetition} style={formStyles.form}>
              <input required type="text" name="compName" defaultValue={editingCompetition.compName} placeholder="Competition Name" />
              <select required name="compType" defaultValue={editingCompetition.compType}>
                <option value="League">League</option>
                <option value="Cup">Cup</option>
                <option value="Continental">Continental</option>
              </select>
              <input type="text" name="country" defaultValue={editingCompetition.country ?? ''} placeholder="Country" />
              <input type="number" step="0.01" name="prizePool" defaultValue={editingCompetition.prizePool ?? ''} placeholder="Prize Pool" />
              <input required type="text" name="organizingBody" defaultValue={editingCompetition.organizingBody} placeholder="Organizing Body" />
              <input type="number" name="ranking" defaultValue={editingCompetition.ranking ?? ''} placeholder="Ranking" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteCompetition} disabled={deleting === 'competition'}>Delete Competition</button>
                <button type="button" onClick={() => setEditingCompetition(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingManager && (
        <div style={modalStyles.overlay} onClick={() => setEditingManager(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Manager Properties</h3>
            <form onSubmit={handleEditManager} style={formStyles.form}>
              <input required type="text" name="coachingLicense" defaultValue={editingManager.coachingLicense} placeholder="Coaching License" />
              <input required type="text" name="preferredFormation" defaultValue={editingManager.preferredFormation} placeholder="Preferred Formation" />
              <input required type="number" name="yearsOfExperience" defaultValue={editingManager.yearsOfExperience} placeholder="Years of Experience" />
              <input type="number" name="clubId" defaultValue={editingManager.clubId ?? ''} placeholder="Club ID" />
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteManager} disabled={deleting === 'manager'}>Delete Manager</button>
                <button type="button" onClick={() => setEditingManager(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingContract && (
        <div style={modalStyles.overlay} onClick={() => setEditingContract(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Contract Properties</h3>
            <form onSubmit={handleEditContract} style={formStyles.form}>
              <select required name="contractStatus" defaultValue={editingContract.contractStatus}>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Terminated">Terminated</option>
              </select>
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteContract} disabled={deleting === 'contract'}>Delete Contract</button>
                <button type="button" onClick={() => setEditingContract(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTransfer && (
        <div style={modalStyles.overlay} onClick={() => setEditingTransfer(null)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Transfer Properties</h3>
            <form onSubmit={handleEditTransfer} style={formStyles.form}>
              <input required type="number" name="personId" defaultValue={editingTransfer.personId} placeholder="Person ID" />
              <input required type="number" name="buyingClubId" defaultValue={editingTransfer.buyingClubId} placeholder="Buying Club ID" />
              <input type="number" name="sellingClubId" defaultValue={editingTransfer.sellingClubId ?? ''} placeholder="Selling Club ID" />
              <input type="number" name="agentId" defaultValue={editingTransfer.agentId ?? ''} placeholder="Agent ID" />
              <input required type="number" step="0.01" name="transferFee" defaultValue={editingTransfer.transferFee} placeholder="Transfer Fee" />
              <select required name="transferType" defaultValue={editingTransfer.transferType}>
                <option value="Permanent">Permanent</option>
                <option value="Loan">Loan</option>
                <option value="Free">Free</option>
              </select>
              <div style={formStyles.buttonGroup}>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={deleteTransfer} disabled={deleting === 'transfer'}>Delete Transfer</button>
                <button type="button" onClick={() => setEditingTransfer(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EntityListPanel({ title, items, emptyLabel }: { title: string; items: EditableEntityItem[]; emptyLabel: string }) {
  return (
    <section className="panel entity-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          <Megaphone size={30} strokeWidth={2.25} />
          <p>No {emptyLabel} were found.</p>
        </div>
      ) : (
        <div className="entity-grid">
          {items.map((item, index) => (
            <article key={`${title}-${index}`} className="entity-tile">
              <h3>{item.title}</h3>
              {item.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {item.onEdit && (
                <button type="button" className="edit-btn" onClick={item.onEdit}>
                  Edit Properties
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
}

const formStyles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
}

export default App
