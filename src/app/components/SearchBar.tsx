"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import styles from "./search.module.css";
import { debounce } from "@/lib/debounce";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";

const suggestionCache: Record<string, { data: Drug[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();

  const fetchSuggestions = useCallback(async (search: string) => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    const cacheKey = `suggestions:${search}`;
    const cached = suggestionCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSuggestions(cached.data);
      return;
    }

    setIsLoading(true);
    try {
      const results = await apiClient.searchDrugs(search, { limit: 10 });
      setSuggestions(results);
      suggestionCache[cacheKey] = { data: results, timestamp: Date.now() };
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize debounce function once and reuse it
  useEffect(() => {
    debouncedFetchRef.current = debounce((search: string) => {
      fetchSuggestions(search);
    }, 500);

    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [fetchSuggestions]);

  useEffect(() => {
    if (query.trim()) {
      debouncedFetchRef.current?.(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/drug/${encodeURIComponent(query.trim())}`);
      setQuery("");
      setSuggestions([]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
  };

  const handleSuggestionClick = useCallback(
    (drugName: string) => {
      router.push(`/drug/${encodeURIComponent(drugName)}`);
      setQuery("");
      setSuggestions([]);
    },
    [router]
  );

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch}>
        <div
          className={`${styles.inputWrapper} ${
            isFocused ? styles.focused : ""
          }`}
        >
          <div className={styles.searchIconWrapper}>
            <FaSearch className={styles.searchIcon} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search drugs..."
            className={styles.searchInput}
            aria-label="Search drugs"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <FaTimes className={styles.clearIcon} />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={styles.searchButton}
            aria-label="Search"
          >
            {isLoading ? (
              <span className={styles.spinner}>
                <FaArrowRight />
              </span>
            ) : (
              <>
                <span>Search</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </form>
      {(suggestions.length > 0 || (query.length >= 2 && !isLoading)) && (
        <div className={styles.suggestionsContainer}>
          {suggestions.length > 0 ? (
            <ul className={styles.suggestionsList}>
              {suggestions.map((drug) => (
                <li
                  key={drug.name}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(drug.name)}
                  role="option"
                  aria-selected="false"
                >
                  <div className={styles.suggestionContent}>
                    <span className={styles.drugName}>{drug.name}</span>
                    {drug.tradeName && (
                      <span className={styles.tradeName}>{drug.tradeName}</span>
                    )}
                  </div>
                  <FaArrowRight className={styles.suggestionIcon} />
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noResults}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(SearchBar);
