import { useCallback, useEffect, useMemo, useState } from "react";
import { partsApi } from "../../../api/partsApi";
import { purchaseApi } from "../../../api/purchaseApi";
import { vendorApi } from "../../../api/vendorApi";
import {
  getApiMessage,
  getErrorMessage,
  toArray,
  unwrapApiResponse,
} from "../../../api/apiResult";

const REFERENCE_HINT =
  "If vendor/part dropdowns are empty, you can still enter backend IDs manually.";

function createRowKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyItem() {
  return {
    key: createRowKey(),
    partId: "",
    quantity: "1",
    unitCost: "0",
  };
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDateTimeLocalString(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function normalizeVendor(rawVendor) {
  const id = rawVendor?.id ?? rawVendor?.vendorId ?? rawVendor?.Id;
  const vendorName =
    rawVendor?.vendorName ??
    rawVendor?.name ??
    rawVendor?.VendorName ??
    "Unnamed vendor";
  const contactPerson = rawVendor?.contactPerson ?? rawVendor?.ContactPerson ?? "";

  return {
    id: id ? String(id) : "",
    vendorName,
    contactPerson,
  };
}

function normalizePart(rawPart) {
  const id = rawPart?.id ?? rawPart?.partId ?? rawPart?.Id;
  const name = rawPart?.name ?? rawPart?.partName ?? rawPart?.Name ?? "Unnamed part";
  const sku =
    rawPart?.sku ??
    rawPart?.partNumber ??
    rawPart?.code ??
    rawPart?.partCode ??
    rawPart?.Sku ??
    rawPart?.PartNumber ??
    "";
  const stockQuantity =
    Number(
      rawPart?.stockQuantity ??
      rawPart?.quantityInStock ??
      rawPart?.quantity ??
      rawPart?.StockQuantity ??
      rawPart?.QuantityInStock ??
      0
    ) || 0;

  return {
    id: id ? String(id) : "",
    name,
    sku,
    stockQuantity,
  };
}

function cleanInvoiceItem(item) {
  const quantity = Math.floor(asNumber(item.quantity));
  const unitCost = asNumber(item.unitCost);

  return {
    partId: String(item.partId || "").trim(),
    quantity,
    unitCost,
  };
}

function normalizeCreatedInvoice(rawInvoice) {
  if (!rawInvoice || typeof rawInvoice !== "object") {
    return null;
  }

  return {
    invoiceId: rawInvoice.invoiceId ?? rawInvoice.InvoiceId ?? "",
    invoiceNumber: rawInvoice.invoiceNumber ?? rawInvoice.InvoiceNumber ?? "",
    purchasedAtUtc: rawInvoice.purchasedAtUtc ?? rawInvoice.PurchasedAtUtc ?? "",
    totalAmount: asNumber(rawInvoice.totalAmount ?? rawInvoice.TotalAmount),
    totalItems: asNumber(rawInvoice.totalItems ?? rawInvoice.TotalItems),
  };
}

export function usePurchases() {
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [referencesError, setReferencesError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vendorId, setVendorId] = useState("");
  const [purchasedAtLocal, setPurchasedAtLocal] = useState(toDateTimeLocalString(new Date()));
  const [items, setItems] = useState([createEmptyItem()]);

  const loadReferences = useCallback(async () => {
    setIsLoadingReferences(true);
    setReferencesError("");

    const [vendorsResult, partsResult] = await Promise.allSettled([
      vendorApi.list(),
      partsApi.list(),
    ]);

    const nextErrors = [];

    if (vendorsResult.status === "fulfilled") {
      try {
        const payload = unwrapApiResponse(vendorsResult.value);
        const mappedVendors = toArray(payload)
          .map(normalizeVendor)
          .filter((vendor) => vendor.id);
        setVendors(mappedVendors);
      } catch (error) {
        nextErrors.push(getErrorMessage(error, "Could not load vendors."));
      }
    } else {
      nextErrors.push(getErrorMessage(vendorsResult.reason, "Could not load vendors."));
    }

    if (partsResult.status === "fulfilled") {
      try {
        const payload = unwrapApiResponse(partsResult.value);
        const mappedParts = toArray(payload).map(normalizePart).filter((part) => part.id);
        setParts(mappedParts);
      } catch (error) {
        nextErrors.push(getErrorMessage(error, "Could not load parts."));
      }
    } else {
      nextErrors.push(getErrorMessage(partsResult.reason, "Could not load parts."));
    }

    setReferencesError(nextErrors.join(" "));
    setIsLoadingReferences(false);
  }, []);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  const updateItem = useCallback((rowKey, field, value) => {
    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.key !== rowKey) {
          return item;
        }

        if (field === "quantity") {
          return { ...item, quantity: String(value) };
        }

        if (field === "unitCost") {
          return { ...item, unitCost: String(value) };
        }

        return { ...item, [field]: value };
      })
    );
  }, []);

  const addItem = useCallback(() => {
    setItems((previousItems) => [...previousItems, createEmptyItem()]);
  }, []);

  const removeItem = useCallback((rowKey) => {
    setItems((previousItems) => {
      if (previousItems.length === 1) {
        return previousItems;
      }

      return previousItems.filter((item) => item.key !== rowKey);
    });
  }, []);

  const totals = useMemo(() => {
    const totalUnits = items.reduce(
      (sum, item) => sum + Math.max(0, Math.floor(asNumber(item.quantity))),
      0
    );

    const totalAmount = items.reduce(
      (sum, item) =>
        sum + Math.max(0, asNumber(item.quantity)) * Math.max(0, asNumber(item.unitCost)),
      0
    );

    return {
      totalUnits,
      totalAmount,
      lineCount: items.length,
    };
  }, [items]);

  const submitInvoice = useCallback(
    async (event) => {
      event.preventDefault();
      setFormError("");
      setSuccessMessage("");
      setCreatedInvoice(null);

      if (!vendorId) {
        setFormError("Please select a vendor.");
        return;
      }

      const cleanedItems = items.map(cleanInvoiceItem);

      if (cleanedItems.some((item) => !item.partId)) {
        setFormError("Each row requires a valid part id.");
        return;
      }

      if (cleanedItems.some((item) => item.quantity <= 0)) {
        setFormError("Each quantity must be greater than zero.");
        return;
      }

      if (cleanedItems.some((item) => item.unitCost < 0)) {
        setFormError("Unit cost cannot be negative.");
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          vendorId,
          purchasedAtUtc: purchasedAtLocal ? new Date(purchasedAtLocal).toISOString() : null,
          items: cleanedItems,
        };

        const response = await purchaseApi.create(payload);
        const responseData = unwrapApiResponse(response);

        setCreatedInvoice(normalizeCreatedInvoice(responseData));
        setSuccessMessage(
          getApiMessage(response, "Purchase invoice created and stock updated.")
        );
        setItems([createEmptyItem()]);
      } catch (error) {
        setFormError(getErrorMessage(error, "Failed to create purchase invoice."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, purchasedAtLocal, vendorId]
  );

  return {
    vendors,
    parts,
    vendorId,
    setVendorId,
    purchasedAtLocal,
    setPurchasedAtLocal,
    items,
    updateItem,
    addItem,
    removeItem,
    totals,
    isLoadingReferences,
    referencesError,
    referenceHint: REFERENCE_HINT,
    formError,
    successMessage,
    createdInvoice,
    isSubmitting,
    submitInvoice,
    reloadReferences: loadReferences,
  };
}
