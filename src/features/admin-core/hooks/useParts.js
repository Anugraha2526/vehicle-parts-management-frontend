import { useState, useEffect, useCallback } from "react";
import { partsApi } from "../../../api/partsApi";

export function useParts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch parts on hook initialization
  const fetchParts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await partsApi.getAll();
      setParts(res.data);
    } catch {
      setError("Failed to load parts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // refresh list after every successful operation
  const createPart = useCallback(
    async (data) => {
      const res = await partsApi.create(data);
      await fetchParts();
      return res.data;
    },
    [fetchParts]
  );

  // send updated fields and re-sync the list
  const updatePart = useCallback(
    async (id, data) => {
      const res = await partsApi.update(id, data);
      await fetchParts();
      return res.data;
    },
    [fetchParts]
  );

  // remove the part and re-sync the list
  const deletePart = useCallback(
    async (id) => {
      await partsApi.delete(id);
      await fetchParts();
    },
    [fetchParts]
  );

  return {
    parts,
    loading,
    error,
    fetchParts,
    createPart,
    updatePart,
    deletePart,
  };
}
