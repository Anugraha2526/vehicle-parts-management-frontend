import { useCallback, useEffect, useMemo, useState } from "react";
import { reportApi } from "../../../api/reportApi";
import { getApiMessage, getErrorMessage, toArray, unwrapApiResponse } from "../../../api/apiResult";

export const FINANCIAL_REPORT_TYPES = ["daily", "monthly", "yearly"];

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function toMonthValue(date) {
  return date.toISOString().slice(0, 7);
}

function normalizeTransaction(rawTransaction) {
  return {
    entryType: rawTransaction?.entryType ?? rawTransaction?.EntryType ?? "",
    invoiceId: rawTransaction?.invoiceId ?? rawTransaction?.InvoiceId ?? "",
    invoiceNumber: rawTransaction?.invoiceNumber ?? rawTransaction?.InvoiceNumber ?? "",
    transactionDateUtc:
      rawTransaction?.transactionDateUtc ?? rawTransaction?.TransactionDateUtc ?? "",
    itemCount: asNumber(rawTransaction?.itemCount ?? rawTransaction?.ItemCount),
    totalAmount: asNumber(rawTransaction?.totalAmount ?? rawTransaction?.TotalAmount),
  };
}

function normalizeTopPart(rawPart) {
  return {
    partId: rawPart?.partId ?? rawPart?.PartId ?? "",
    partName: rawPart?.partName ?? rawPart?.PartName ?? "Unnamed part",
    quantity: asNumber(rawPart?.quantity ?? rawPart?.Quantity),
    amount: asNumber(rawPart?.amount ?? rawPart?.Amount),
  };
}

function normalizeReport(rawReport) {
  if (!rawReport || typeof rawReport !== "object") {
    return null;
  }

  return {
    periodType: rawReport.periodType ?? rawReport.PeriodType ?? "",
    referenceDateUtc: rawReport.referenceDateUtc ?? rawReport.ReferenceDateUtc ?? "",
    periodStartUtc: rawReport.periodStartUtc ?? rawReport.PeriodStartUtc ?? "",
    periodEndUtc: rawReport.periodEndUtc ?? rawReport.PeriodEndUtc ?? "",
    generatedAtUtc: rawReport.generatedAtUtc ?? rawReport.GeneratedAtUtc ?? "",
    purchaseInvoiceCount: asNumber(
      rawReport.purchaseInvoiceCount ?? rawReport.PurchaseInvoiceCount
    ),
    totalPurchaseAmount: asNumber(rawReport.totalPurchaseAmount ?? rawReport.TotalPurchaseAmount),
    salesInvoiceCount: asNumber(rawReport.salesInvoiceCount ?? rawReport.SalesInvoiceCount),
    totalSalesAmount: asNumber(rawReport.totalSalesAmount ?? rawReport.TotalSalesAmount),
    netAmount: asNumber(rawReport.netAmount ?? rawReport.NetAmount),
    transactions: toArray(rawReport.transactions ?? rawReport.Transactions).map(
      normalizeTransaction
    ),
    topPurchaseParts: toArray(rawReport.topPurchaseParts ?? rawReport.TopPurchaseParts).map(
      normalizeTopPart
    ),
    topSalesParts: toArray(rawReport.topSalesParts ?? rawReport.TopSalesParts).map(
      normalizeTopPart
    ),
  };
}

function formatDateFromYearMonth(yearMonth) {
  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    return null;
  }

  return `${yearMonth}-01`;
}

export function useReports() {
  const now = useMemo(() => new Date(), []);
  const [reportType, setReportType] = useState("daily");
  const [dailyDate, setDailyDate] = useState(() => toIsoDate(now));
  const [monthlyPeriod, setMonthlyPeriod] = useState(() => toMonthValue(now));
  const [yearlyPeriod, setYearlyPeriod] = useState(() => String(now.getUTCFullYear()));

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedReferenceDate = useMemo(() => {
    if (reportType === "daily") {
      return dailyDate || toIsoDate(new Date());
    }

    if (reportType === "monthly") {
      return formatDateFromYearMonth(monthlyPeriod) ?? toIsoDate(new Date());
    }

    const parsedYear = Number.parseInt(yearlyPeriod, 10);
    const safeYear = Number.isFinite(parsedYear) ? parsedYear : new Date().getUTCFullYear();
    return `${safeYear}-01-01`;
  }, [dailyDate, monthlyPeriod, reportType, yearlyPeriod]);

  const fetchReport = useCallback(async (nextType, referenceDate, options = {}) => {
    const { showMessage = false } = options;
    const normalizedType = String(nextType || "daily").toLowerCase();

    if (!FINANCIAL_REPORT_TYPES.includes(normalizedType)) {
      setError("Invalid report type selected.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await reportApi.financial(normalizedType, referenceDate);
      const responseData = unwrapApiResponse(response);

      setReport(normalizeReport(responseData));
      if (showMessage) {
        setMessage(getApiMessage(response, "Financial report refreshed."));
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load financial report."));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReport(reportType, selectedReferenceDate, { showMessage: false });
  }, [fetchReport, reportType, selectedReferenceDate]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  const changeReportType = useCallback((nextType) => {
    setReportType(nextType);
  }, []);

  const refresh = useCallback(() => {
    return fetchReport(reportType, selectedReferenceDate, { showMessage: true });
  }, [fetchReport, reportType, selectedReferenceDate]);

  const exportCsv = useCallback(() => {
    if (!report) {
      return;
    }

    const header = [
      "EntryType",
      "DateUtc",
      "InvoiceNumber",
      "InvoiceId",
      "ItemCount",
      "TotalAmount",
    ];

    const rows = report.transactions.map((transaction) => [
      transaction.entryType,
      transaction.transactionDateUtc,
      transaction.invoiceNumber,
      transaction.invoiceId,
      String(transaction.itemCount),
      String(transaction.totalAmount),
    ]);

    const csvBody = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `financial-report-${report.periodType || "period"}-${selectedReferenceDate}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [report, selectedReferenceDate]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getUTCFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= currentYear - 8; year -= 1) {
      years.push(String(year));
    }
    if (!years.includes(yearlyPeriod)) {
      years.unshift(yearlyPeriod);
    }
    return years;
  }, [yearlyPeriod]);

  return {
    reportType,
    setReportType: changeReportType,
    report,
    isLoading,
    error,
    message,
    refresh,
    dailyDate,
    setDailyDate,
    monthlyPeriod,
    setMonthlyPeriod,
    yearlyPeriod,
    setYearlyPeriod,
    yearOptions,
    exportCsv,
    printReport,
  };
}
