from enum import Enum
from typing import List, Any, Generic, TypeVar, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

class OperationType(str, Enum):
    DEPOSIT = "DEPOSIT"
    TRANSFER = "TRANSFER"
    LOAN = "LOAN"
    INSTALLMENT = "INSTALLMENT"

class OperationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    ESCALATED = "ESCALATED"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"

class InstallmentFrequency(str, Enum):
    MONTHLY = "MONTHLY"
    SEMI_ANNUAL = "SEMI_ANNUAL"
    ANNUAL = "ANNUAL"

class OperationRequestOrigin(BaseModel):
    ip: str
    userAgent: str
    country: str
    city: str

class OperationStatusPhase(BaseModel):
    status: OperationStatus
    createdAt: datetime
    reason: str

class DepositDetails(BaseModel):
    clientId: UUID
    clientBankAccountId: UUID
    amount: Decimal
    status: OperationStatus
    statusHistory: List[OperationStatusPhase]
    origin: OperationRequestOrigin
    createdAt: datetime

class LoanDetails(BaseModel):
    clientId: UUID
    clientBankAccountId: UUID
    amount: Decimal
    status: OperationStatus
    statusHistory: List[OperationStatusPhase]
    origin: OperationRequestOrigin
    createdAt: datetime
    termPeriods: int
    installmentFrequency: InstallmentFrequency
    interestRate: Decimal

class TransferDetails(BaseModel):
    clientId: UUID
    clientBankAccountId: UUID
    amount: Decimal
    status: OperationStatus
    statusHistory: List[OperationStatusPhase]
    origin: OperationRequestOrigin
    createdAt: datetime
    targetBankAccountId: UUID
    concept: str

class ClientAccountBlockEvent(BaseModel):
    clientId: UUID

class FraudDetectedEvent(BaseModel):
    operationId: UUID
    clientId: UUID
    clientBankAccountId: UUID
    amount: Decimal
    reason: str

T = TypeVar("T")

class OperationPendingEvent(BaseModel, Generic[T]):
    operationId: UUID
    operationType: "OperationType"
    details: Any

class OperationResolutionEvent(BaseModel):
    operationId: UUID
    operationType: "OperationType"
    reason: str