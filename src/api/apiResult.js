export function unwrapApiResponse(response) {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Request failed.");
    }

    return payload.data;
  }

  return payload;
}

export function getApiMessage(response, fallback = "") {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "message" in payload) {
    return payload.message || fallback;
  }

  return fallback;
}

export function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value.items)) {
      return value.items;
    }

    if (Array.isArray(value.data)) {
      return value.data;
    }
  }

  return [];
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const fallbackMessage = fallback || "Something went wrong.";

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    if (typeof responseData.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    const firstEntry = Object.values(responseData)[0];

    if (typeof firstEntry === "string" && firstEntry.trim()) {
      return firstEntry;
    }

    if (Array.isArray(firstEntry) && firstEntry.length > 0) {
      return String(firstEntry[0]);
    }
  }

  return fallbackMessage;
}
