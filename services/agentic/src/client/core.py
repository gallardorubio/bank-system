import base64
import time
from typing import List, Optional
from uuid import UUID
import httpx
from pydantic import TypeAdapter
from src import config
from src.models.dtos import (
    BankAccountEntryResponse,
    BankAccountResponse,
    ClientResponse,
    OperationItemResponse,
    TrustedBankAccountResponse,
)

_operations_adapter = TypeAdapter(List[OperationItemResponse])
_entries_adapter = TypeAdapter(List[BankAccountEntryResponse])
_trusted_adapter = TypeAdapter(List[TrustedBankAccountResponse])


class CoreApiClient:
    def __init__(self):
        self.base_url = config.CORE_API_URL.rstrip("/")
        self._token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def _get_access_token(self) -> str:
        now = time.time()
        if self._token and now < self._token_expires_at - 60:
            return self._token

        token_url = f"{config.COGNITO_DOMAIN.rstrip('/')}/oauth2/token"
        credentials = f"{config.COGNITO_CLIENT_ID}:{config.COGNITO_CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {encoded_credentials}",
        }
        data = {
            "grant_type": "client_credentials",
            "scope": config.COGNITO_AGENTIC_SCOPE,
        }

        with httpx.Client(timeout=10.0) as client:
            response = client.post(token_url, headers=headers, data=data)
            response.raise_for_status()
            token_data = response.json()

        self._token = token_data["access_token"]
        self._token_expires_at = now + token_data.get("expires_in", 3600)
        return self._token

    def _get_headers(self) -> dict:
        token = self._get_access_token()
        return {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    def get_client(self, client_id: UUID) -> ClientResponse:
        url = f"{self.base_url}/api/v1/clients/{client_id}"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return ClientResponse(**response.json())

    def get_bank_account(self, bank_account_id: UUID) -> BankAccountResponse:
        url = f"{self.base_url}/api/v1/bank-accounts/{bank_account_id}"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return BankAccountResponse(**response.json())

    def get_client_entries(self, client_id: UUID) -> List[BankAccountEntryResponse]:
        url = f"{self.base_url}/api/v1/bank-accounts/{client_id}/entries"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return _entries_adapter.validate_python(response.json())

    def get_client_operations(self, client_id: UUID) -> List[OperationItemResponse]:
        url = f"{self.base_url}/api/v1/operations/clients/{client_id}"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return _operations_adapter.validate_python(response.json())
    
    def get_client_trusted_accounts(self, client_id: UUID) -> List[TrustedBankAccountResponse]:
        url = f"{self.base_url}/api/v1/clients/{client_id}/trusted-accounts"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return _trusted_adapter.validate_python(response.json())


core_client = CoreApiClient()