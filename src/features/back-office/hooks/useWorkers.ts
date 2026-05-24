import { useState, useEffect, useCallback } from "react";
import { operatorPremieService, Worker } from "../services/operator-premie-service";

export const useWorkers = (month: number, year: number) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await operatorPremieService.fetchWorkers(month, year);
      setWorkers(data);
      setHasMore(data.length === 10);
    } catch (err) {
      setError("Не удалось загрузить данные.");
      setWorkers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || workers.length === 0 || isSearching) return;

    setLoadingMore(true);
    setError(null);
    try {
      const lastId = workers[workers.length - 1]?.ID;
      const data = await operatorPremieService.fetchWorkers(month, year, lastId);
      setWorkers((prev) => [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch (err) {
      setError("Не удалось загрузить дополнительные данные.");
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, workers, isSearching, month, year]);

  useEffect(() => {
    const loadAllData = async () => {
      let all: Worker[] = [];
      let afterID: number | null = null;

      try {
        while (true) {
          const chunk = await operatorPremieService.fetchWorkers(month, year, afterID);
          if (!chunk || chunk.length === 0) break;

          all = [...all, ...chunk];
          afterID = chunk[chunk.length - 1]?.ID;
          if (chunk.length < 10) break;
        }
        setAllWorkers(all);
      } catch (err) {
        console.error("Error loading all workers for search:", err);
      }
    };

    loadAllData();
  }, [month, year]);

  const handleSearch = useCallback(
    async (filtered: Worker[] | null) => {
      if (!filtered) {
        setIsSearching(false);
        await loadInitial();
        return;
      }

      setIsSearching(true);
      setWorkers(filtered);
      setHasMore(false);
    },
    [loadInitial],
  );

  return {
    workers,
    allWorkers,
    loading,
    loadingMore,
    hasMore,
    error,
    isSearching,
    loadMore,
    handleSearch,
    refresh: loadInitial,
  };
};
