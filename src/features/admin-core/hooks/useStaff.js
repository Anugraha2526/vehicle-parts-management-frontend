import { useState, useEffect, useCallback } from "react";
import { staffApi } from "../../../api/staffApi";

export function useStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch staff list on component mount
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffApi.getAll();
      setStaff(res.data);
    } catch {
      setError("Failed to load staff. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // create new staff and refresh list
  const createStaff = useCallback(
    async (data) => {
      const res = await staffApi.create(data);
      await fetchStaff();
      return res.data;
    },
    [fetchStaff]
  );

  // update staff and refresh list
  const updateStaff = useCallback(
    async (id, data) => {
      const res = await staffApi.update(id, data);
      await fetchStaff();
      return res.data;
    },
    [fetchStaff]
  );

  // delete staff and refresh list
  const deleteStaff = useCallback(
    async (id) => {
      await staffApi.delete(id);
      await fetchStaff();
    },
    [fetchStaff]
  );

  // toggle active status and refresh list
  const toggleStatus = useCallback(
    async (id) => {
      await staffApi.toggleStatus(id);
      await fetchStaff();
    },
    [fetchStaff]
  );

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStatus,
  };
}
