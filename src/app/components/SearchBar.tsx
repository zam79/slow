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
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (search: string) => {
    if (search.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setMessage(null);
      return;
    }

    const cacheKey = `suggestions:${search}`;
    const cached = suggestionCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSuggestions(cached.data);
      setIsLoading(false);
      setMessage(null);
      return;
    }

    try {
      const results = await apiClient.searchDrugs(search, { limit: 10 });
      setSuggestions(results);
      suggestionCache[cacheKey] = { data: results, timestamp: Date.now() };
      setMessage(null);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setMessage("Failed to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFullSearchResults = useCallback(async (search: string) => {
    try {
      const results = await apiClient.searchDrugs(search, {});
      const sortedResults = results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setSearchResults(sortedResults);
      setMessage(
        sortedResults.length === 0
          ? "No results found. Please refine your search."
          : null
      );
    } catch (error) {
      console.error("Error fetching full search results:", error);
      setSearchResults([]);
      setMessage("Failed to fetch search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setIsLoading(true);
      debouncedFetchRef.current?.(query);
    } else {
      setSuggestions([]);
      setSearchResults([]);
      setIsLoading(false);
      setMessage(null);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage("Please enter a search query.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setSearchResults([]);
    setSuggestions([]);

    if (query.trim().length === 3) {
      setMessage(
        "Your search yields too many results. Please narrow your search further."
      );
      setIsLoading(false);
      return;
    }

    await fetchFullSearchResults(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setSearchResults([]);
    setIsLoading(false);
    setMessage(null);
  };

  const handleSuggestionClick = useCallback(
    (drugName: string) => {
      router.push(`/drug/${encodeURIComponent(drugName)}`);
      setQuery("");
      setSuggestions([]);
      setSearchResults([]);
      setIsLoading(false);
      setMessage(null);
    },
    [router]
  );

  return (
    <div className={styles.searchContainer} ref={containerRef}>
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
            className={`${styles.searchButton} ${
              isLoading ? styles.loading : ""
            }`}
            aria-label="Search"
          >
            {isLoading ? (
              <>
                <span className={styles.spinnerDots}></span>
                <FaArrowRight />
              </>
            ) : (
              <>
                <span>Search</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </form>
      {message && <div className={styles.message}>{message}</div>}
      {isFocused && suggestions.length > 0 && !searchResults.length && (
        <div className={styles.suggestionsContainer} ref={suggestionsRef}>
          <ul className={styles.suggestionsList}>
            {suggestions.map((drug) => (
              <li
                key={drug.name}
                className={styles.suggestionItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(drug.name)}
                role="option"
                aria-selected="false"
              >
                <div className={styles.suggestionContent}>
                  <span className={styles.drugName}>
                    {drug.name.replace(/-/g, " ")} {/* Display with spaces */}
                  </span>
                  {drug.trade_name && (
                    <span className={styles.tradeName}>{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight className={styles.suggestionIcon} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Search Results</h3>
          <ul className={styles.resultsList}>
            {searchResults.map((drug) => (
              <li
                key={drug.name}
                className={styles.resultItem}
                onClick={() => handleSuggestionClick(drug.name)}
                role="option"
                aria-selected="false"
              >
                <div className={styles.resultContent}>
                  <span className={styles.drugName}>
                    {drug.name.replace(/-/g, " ")} {/* Display with spaces */}
                  </span>
                  {drug.trade_name && (
                    <span className={styles.tradeName}>{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight className={styles.resultIcon} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(SearchBar);
