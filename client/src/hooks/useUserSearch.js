import { useEffect, useState } from "react";
import api from "../api/api";

/**
 * Fetch users search results with debounce
 * Matches your Home.jsx logic:
 * GET /users/searchUsers?q=
 */
export default function useUserSearch(searchInput, debounceMs = 300) {
  const [results, setResults] = useState([]);
  const [isLoadingSearching, setIsLoadingSearching] = useState(false);

  useEffect(() => {
    if (!searchInput) {
      setResults([]);
      setIsLoadingSearching(false);
      return;
    }

    setIsLoadingSearching(true);

    let cancelled = false;

    const fetchResults = async () => {
      try {
        const res = await api.get(`/users/searchUsers?q=${searchInput}`, {
          withCredentials: true,
        });
        console.log("fetchResults res", res);
        if (!cancelled) setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (!cancelled) setIsLoadingSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchInput, debounceMs]);

  return { results, isLoadingSearching, setResults };
}
