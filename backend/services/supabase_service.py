import httpx
import json
from typing import Optional, Any, Dict, List
from decimal import Decimal
from config import SUPABASE_REST_URL, SUPABASE_API_KEY

class SupabaseService:
    def __init__(self):
        self.base_url = SUPABASE_REST_URL
        self.api_key = SUPABASE_API_KEY
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _table_path(self, table: str) -> str:
        """Map code-level table names to the lowercase Supabase table names created by PostgreSQL."""
        return table.lower()

    def _id_column(self, table: str) -> str:
        """Return the primary key column used by the requested table."""
        return {
            "person": "personid",
            "agent": "agentid",
            "club": "clubid",
            "sponsor": "sponsorid",
            "competition": "compid",
            "player": "personid",
            "manager": "personid",
            "contract": "contractid",
            "employmentcontract": "contractid",
            "sponsorshipcontract": "contractid",
            "transfer": "transferid",
        }.get(table.lower(), "id")

    def _normalize_row(self, table: str, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Supabase's lowercase identifiers into the API response shape."""
        key_map = {
            "person": {
                "personid": "personId",
                "firstname": "firstName",
                "lastname": "lastName",
                "dateofbirth": "dateOfBirth",
                "nationality": "nationality",
                "email": "email",
                "phonenumber": "phoneNumber",
            },
            "club": {
                "clubid": "clubId",
                "clubname": "clubName",
                "stadiumname": "stadiumName",
                "stadiumcapacity": "stadiumCapacity",
                "city": "city",
                "country": "country",
                "transferbudget": "transferBudget",
                "yearfounded": "yearFounded",
            },
            "player": {
                "personid": "personId",
                "primaryposition": "primaryPosition",
                "preferredfoot": "preferredFoot",
                "marketvalue": "marketValue",
                "jerseynumber": "jerseyNumber",
                "height": "height",
                "weight": "weight",
            },
            "agent": {
                "agentid": "agentId",
                "firstname": "firstName",
                "lastname": "lastName",
                "agencyname": "agencyName",
                "licensenumber": "licenseNumber",
                "commissionrate": "commissionRate",
                "email": "email",
                "phonenumber": "phoneNumber",
            },
            "manager": {
                "personid": "personId",
                "clubid": "clubId",
                "coachinglicense": "coachingLicense",
                "preferredformation": "preferredFormation",
                "yearsofexperience": "yearsOfExperience",
            },
            "sponsor": {
                "sponsorid": "sponsorId",
                "sponsorname": "sponsorName",
                "industry": "industry",
                "hqcountry": "hqCountry",
                "contactemail": "contactEmail",
                "contactphone": "contactPhone",
                "website": "website",
            },
            "competition": {
                "compid": "compId",
                "compname": "compName",
                "comptype": "compType",
                "country": "country",
                "prizepool": "prizePool",
                "organizingbody": "organizingBody",
                "ranking": "ranking",
            },
            "contract": {
                "contractid": "contractId",
                "personid": "personId",
                "startdate": "startDate",
                "enddate": "endDate",
                "signingdate": "signingDate",
                "contractstatus": "contractStatus",
            },
            "employmentcontract": {
                "contractid": "contractId",
                "clubid": "clubId",
                "weeklysalary": "weeklySalary",
                "releaseclause": "releaseClause",
                "signingbonus": "signingBonus",
                "performancebonus": "performanceBonus",
            },
            "sponsorshipcontract": {
                "contractid": "contractId",
                "sponsorid": "sponsorId",
                "contractvalue": "contractValue",
                "paymentfrequency": "paymentFrequency",
                "endorsementtype": "endorsementType",
            },
            "transfer": {
                "transferid": "transferId",
                "personid": "personId",
                "buyingclubid": "buyingClubId",
                "sellingclubid": "sellingClubId",
                "agentid": "agentId",
                "transferfee": "transferFee",
                "transfertype": "transferType",
            },
        }

        decimal_fields = {
            "player": {"marketValue", "height", "weight"},
            "club": {"transferBudget"},
            "agent": {"commissionRate"},
            "competition": {"prizePool"},
            "employmentcontract": {"weeklySalary", "releaseClause", "signingBonus", "performanceBonus"},
            "sponsorshipcontract": {"contractValue"},
            "transfer": {"transferFee"},
        }

        normalized: Dict[str, Any] = {}
        table_key_map = key_map.get(table.lower(), {})
        table_decimal_fields = decimal_fields.get(table.lower(), set())

        for key, value in row.items():
            normalized_key = table_key_map.get(key.lower(), key)
            if normalized_key in table_decimal_fields and value is not None:
                normalized[normalized_key] = str(value)
            else:
                normalized[normalized_key] = value

        return normalized

    def _normalize_rows(self, table: str, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self._normalize_row(table, row) for row in rows]

    def _serialize_payload(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert API-style camelCase payloads into lowercase database column names."""
        table_name = table.lower()
        reverse_maps = {
            "person": {
                "firstName": "firstname",
                "lastName": "lastname",
                "dateOfBirth": "dateofbirth",
                "nationality": "nationality",
                "email": "email",
                "phoneNumber": "phonenumber",
            },
            "club": {
                "clubName": "clubname",
                "stadiumName": "stadiumname",
                "stadiumCapacity": "stadiumcapacity",
                "city": "city",
                "country": "country",
                "transferBudget": "transferbudget",
                "yearFounded": "yearfounded",
            },
            "player": {
                "personId": "personid",
                "primaryPosition": "primaryposition",
                "preferredFoot": "preferredfoot",
                "marketValue": "marketvalue",
                "jerseyNumber": "jerseynumber",
                "height": "height",
                "weight": "weight",
                "clubId": "clubid",
            },
            "agent": {
                "firstName": "firstname",
                "lastName": "lastname",
                "agencyName": "agencyname",
                "licenseNumber": "licensenumber",
                "commissionRate": "commissionrate",
                "email": "email",
                "phoneNumber": "phonenumber",
            },
            "manager": {
                "personId": "personid",
                "clubId": "clubid",
                "coachingLicense": "coachinglicense",
                "preferredFormation": "preferredformation",
                "yearsOfExperience": "yearsofexperience",
            },
            "sponsor": {
                "sponsorName": "sponsorname",
                "industry": "industry",
                "hqCountry": "hqcountry",
                "contactEmail": "contactemail",
                "contactPhone": "contactphone",
                "website": "website",
            },
            "competition": {
                "compName": "compname",
                "compType": "comptype",
                "country": "country",
                "prizePool": "prizepool",
                "organizingBody": "organizingbody",
                "ranking": "ranking",
            },
            "contract": {
                "personId": "personid",
                "startDate": "startdate",
                "endDate": "enddate",
                "signingDate": "signingdate",
                "contractStatus": "contractstatus",
            },
            "employmentcontract": {
                "contractId": "contractid",
                "clubId": "clubid",
                "weeklySalary": "weeklysalary",
                "releaseClause": "releaseclause",
                "signingBonus": "signingbonus",
                "performanceBonus": "performancebonus",
            },
            "sponsorshipcontract": {
                "contractId": "contractid",
                "sponsorId": "sponsorid",
                "contractValue": "contractvalue",
                "paymentFrequency": "paymentfrequency",
                "endorsementType": "endorsementtype",
            },
            "transfer": {
                "personId": "personid",
                "buyingClubId": "buyingclubid",
                "sellingClubId": "sellingclubid",
                "agentId": "agentid",
                "transferFee": "transferfee",
                "transferType": "transfertype",
            },
        }

        serialized: Dict[str, Any] = {}
        field_map = reverse_maps.get(table_name, {})

        for key, value in data.items():
            column_name = field_map.get(key, key.lower())
            if hasattr(value, "isoformat"):
                serialized[column_name] = value.isoformat()
            elif isinstance(value, Decimal):
                serialized[column_name] = float(value)
            elif hasattr(value, "model_dump"):
                serialized[column_name] = value.model_dump()
            else:
                serialized[column_name] = value

        return serialized

    async def get(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        select: str = "*",
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch records from a table with optional filtering and pagination."""
        url = f"{self.base_url}/{self._table_path(table)}"
        params = {"select": select}

        if filters:
            for key, value in filters.items():
                params[key.lower()] = f"eq.{value}" if not isinstance(value, str) else f"eq.{value}"

        if order_by:
            params["order"] = order_by
        if limit:
            params["limit"] = limit
        if offset:
            params["offset"] = offset

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            return self._normalize_rows(table, result)

    async def get_by_id(self, table: str, id: int, select: str = "*") -> Dict[str, Any]:
        """Fetch a single record by ID."""
        id_column = self._id_column(table)
        url = f"{self.base_url}/{self._table_path(table)}?{id_column}=eq.{id}&select={select}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            if not data:
                raise ValueError(f"Record not found in {table} with id {id}")
            return self._normalize_row(table, data[0])

    async def post(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record in a table."""
        url = f"{self.base_url}/{self._table_path(table)}"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=self._serialize_payload(table, data),
                headers={**self.headers, "Prefer": "return=representation"}
            )
            response.raise_for_status()
            result = response.json()
            # Supabase returns a list even for single inserts
            normalized = result[0] if isinstance(result, list) and result else result
            return self._normalize_row(table, normalized)

    async def patch(self, table: str, id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a record in a table."""
        id_column = self._id_column(table)
        url = f"{self.base_url}/{self._table_path(table)}?{id_column}=eq.{id}"
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                json=self._serialize_payload(table, data),
                headers={**self.headers, "Prefer": "return=representation"}
            )
            response.raise_for_status()
            result = response.json()
            normalized = result[0] if isinstance(result, list) and result else result
            return self._normalize_row(table, normalized)

    async def delete(self, table: str, id: int) -> None:
        """Delete a record from a table."""
        id_column = self._id_column(table)
        url = f"{self.base_url}/{self._table_path(table)}?{id_column}=eq.{id}"
        async with httpx.AsyncClient() as client:
            response = await client.delete(url, headers=self.headers)
            response.raise_for_status()

    async def rpc(self, function_name: str, params: Dict[str, Any]) -> Any:
        """Call a Supabase RPC function."""
        url = f"{self.base_url}/rpc/{function_name}"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=params, headers=self.headers)
            response.raise_for_status()
            return response.json()

# Global instance
supabase = SupabaseService()
