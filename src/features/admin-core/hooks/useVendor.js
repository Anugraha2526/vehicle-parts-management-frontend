import { useState, useEffect, useCallback } from "react";
import { vendorApi } from "../../../api/vendorApi";

export function useVendor() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch vendors on hook initialization
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorApi.getAll();
      setVendors(res.data);
    } catch {
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // refresh list after every successful operation
  const createVendor = useCallback(
    async (data) => {
      const res = await vendorApi.create(data);
      await fetchVendors();
      return res.data;
    },
    [fetchVendors]
  );

  const updateVendor = useCallback(
    async (id, data) => {
      const res = await vendorApi.update(id, data);
      await fetchVendors();
      return res.data;
    },
    [fetchVendors]
  );

  const deleteVendor = useCallback(
    async (id) => {
      await vendorApi.delete(id);
      await fetchVendors();
    },
    [fetchVendors]
  );

  return {
    vendors,
    loading,
    error,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}
