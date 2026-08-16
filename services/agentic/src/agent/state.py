from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from src.models.dtos import (
    BankAccountEntryResponse,
    BankAccountResponse,
    ClientResponse,
    OperationItemResponse,
    TrustedBankAccountResponse,
)
from src.models.events import OperationType


class EvaluationSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PillarEvaluation(BaseModel):
    passed: bool
    severity: EvaluationSeverity
    reason: str
    risk_score: float = Field(ge=0.0, le=1.0)


class SecurityEvaluation(PillarEvaluation):
    suspicious_origin: bool
    requires_client_block: bool = False


class FraudEvaluation(PillarEvaluation):
    is_fraud: bool
    requires_client_block: bool = False


class CreditEvaluation(PillarEvaluation):
    creditworthy: bool
    recommended_action: str


class ResolutionAction(str, Enum):
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    ESCALATED = "ESCALATED"


class FinalDecision(BaseModel):
    action: ResolutionAction
    reason: str
    is_fraud: bool = False
    block_client: bool = False


class AgentState(BaseModel):
    operation_id: UUID
    operation_type: OperationType
    details: Dict[str, Any]
    client_id: Optional[UUID] = None
    client_bank_account_id: Optional[UUID] = None
    amount: Decimal = Decimal("0.0")

    client_data: Optional[ClientResponse] = None
    account_data: Optional[BankAccountResponse] = None
    historical_entries: List[BankAccountEntryResponse] = []
    historical_operations: List[OperationItemResponse] = []
    trusted_accounts: List[TrustedBankAccountResponse] = []

    security_eval: Optional[SecurityEvaluation] = None
    fraud_eval: Optional[FraudEvaluation] = None
    credit_eval: Optional[CreditEvaluation] = None

    decision: Optional[FinalDecision] = None