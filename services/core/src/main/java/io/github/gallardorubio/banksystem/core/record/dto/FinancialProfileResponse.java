package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;
import java.util.List;

public record FinancialProfileResponse(
    BigDecimal currentBalance,
    String currency,
    List<EntrySummary> recentEntries
) {}