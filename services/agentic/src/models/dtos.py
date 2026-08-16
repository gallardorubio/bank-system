from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, List, Literal, Optional, Union
from uuid import UUID
from pydantic import BaseModel, Field
from src.models.events import (
    InstallmentFrequency,
    OperationStatus,
    OperationStatusPhase,
    OperationType,
)

class OperationDirection(str, Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"

class ClientResponse(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    birthDate: Optional[date] = None
    email: str
    taxId: str
    mfaEnabled: bool

class BankAccountResponse(BaseModel):
    id: UUID
    clientName: str
    currency: str
    balance: Decimal

class BankAccountEntryResponse(BaseModel):
    id: UUID
    operationId: UUID
    operationType: OperationType
    description: Optional[str] = None
    amount: Decimal
    operationDirection: OperationDirection
    createdAt: datetime

class BaseOperationResponse(BaseModel):
    id: UUID
    clientBankAccountId: UUID
    amount: Decimal
    status: OperationStatus
    statusHistory: List[OperationStatusPhase]
    createdAt: datetime

class DepositResponse(BaseOperationResponse):
    operationType: Literal[OperationType.DEPOSIT] = OperationType.DEPOSIT

class TransferResponse(BaseOperationResponse):
    operationType: Literal[OperationType.TRANSFER] = OperationType.TRANSFER
    targetBankAccountId: UUID
    concept: str

class LoanResponse(BaseOperationResponse):
    operationType: Literal[OperationType.LOAN] = OperationType.LOAN
    termPeriods: int
    installmentFrequency: InstallmentFrequency
    interestRate: Decimal
    paidAmount: Decimal
    installmentsPaid: int
    nextInstallmentAmount: Optional[Decimal] = None
    nextInstallmentDate: Optional[datetime] = None
    maturityDate: Optional[datetime] = None

class InstallmentResponse(BaseOperationResponse):
    operationType: Literal[OperationType.INSTALLMENT] = OperationType.INSTALLMENT
    loanId: UUID

OperationItemResponse = Annotated[
    Union[DepositResponse, TransferResponse, LoanResponse, InstallmentResponse],
    Field(discriminator="operationType"),
]

class TrustedBankAccountResponse(BaseModel):
    bankAccountId: UUID
    clientName: str