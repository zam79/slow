"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import styles from "./search.module.css";
import { debounce } from "@/lib/debounce";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";

// Configuration constants
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache
const MIN_SEARCH_CHARS = 2; // Minimum characters before searching
const MAX_SUGGESTIONS = 10; // Max suggestions to show
const DEBOUNCE_DELAY = 300; // Debounce delay in ms
const API_TIMEOUT = 5000; // 5-second API timeout

// Type for cached suggestions
type SuggestionCache = Record<
  string,
  {
    data: Drug[];
    timestamp: number;
  }
>;

interface SearchBarProps {
  onDrugSelect: (drug: Drug) => void;
  resetTrigger: number;
}

const SearchBar = memo(function SearchBar({
  onDrugSelect,
  resetTrigger,
}: SearchBarProps) {
  // State management
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cache, setCache] = useState<SuggestionCache>({});

  // Hooks and refs
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Attempt to focus input
  const attemptFocus = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsFocused(true);
      }
    }, 100);
  }, []);

  // Handle mount/unmount
  useEffect(() => {
    attemptFocus();
    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [attemptFocus]);

  // Reset search bar when resetTrigger changes
  useEffect(() => {
    setQuery("");
    setSuggestions([]);
    setSearchResults([]);
    setIsLoading(false);
    setMessage(null);
    attemptFocus();
  }, [resetTrigger, attemptFocus]);

  // Maintain focus during typing
  useEffect(() => {
    if (query.trim() && !isFocused) {
      attemptFocus();
    }
  }, [query, isFocused, attemptFocus]);

  // Fetches search suggestions with caching and timeout
  const fetchSuggestions = useCallback(
    async (search: string) => {
      if (search.length < MIN_SEARCH_CHARS) {
        setSuggestions([]);
        setIsLoading(false);
        setMessage(null);
        return;
      }

      const cacheKey = `suggestions:${search.toLowerCase()}`;
      if (
        cache[cacheKey] &&
        Date.now() - cache[cacheKey].timestamp < CACHE_DURATION &&
        cache[cacheKey].data.length > 0
      ) {
        setSuggestions(cache[cacheKey].data);
        setIsLoading(false);
        setMessage(null);
        return;
      }

      try {
        setIsLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          setMessage("Search timed out. Please try again.");
        }, API_TIMEOUT);

        const results = await apiClient.searchDrugs(search, { limit: 100, signal: controller.signal });
        clearTimeout(timeoutId);

        const validResults = results;

        setCache((prev) => ({
          ...prev,
          [cacheKey]: {
            data: validResults.slice(0, MAX_SUGGESTIONS),
            timestamp: Date.now(),
          },
        }));

        setSuggestions(validResults.slice(0, MAX_SUGGESTIONS));
        setMessage(
          validResults.length === 0 ? "No suggestions found." : null
        );
      } catch (error: unknown) {
        setSuggestions([]);
        setMessage(
          error instanceof Error && error.name === "AbortError"
            ? "Search timed out. Please try again."
            : error instanceof Error
              ? error.message
              : "Failed to fetch suggestions. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  // Setup debounce effect
  useEffect(() => {
    debouncedFetchRef.current = debounce((search: string) => {
      fetchSuggestions(search);
    }, DEBOUNCE_DELAY);
    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [fetchSuggestions]);

  // Handle query changes
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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetches complete search results
  const fetchFullSearchResults = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      setMessage(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setMessage("Search timed out. Please try again.");
      }, API_TIMEOUT);

      const results = await apiClient.searchDrugs(search, { limit: 100, signal: controller.signal });
      clearTimeout(timeoutId);

      const sortedResults = [...results].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setSearchResults(sortedResults);
      setMessage(
        sortedResults.length === 0
          ? "No results found. Please refine your search."
          : null
      );
    } catch (error: unknown) {
      setSearchResults([]);
      setMessage(
        error instanceof Error && error.name === "AbortError"
          ? "Search timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to fetch results. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handles search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage("Please enter a search query.");
      return;
    }

    if (query.trim().length < MIN_SEARCH_CHARS) {
      setMessage(`Please enter at least ${MIN_SEARCH_CHARS} characters.`);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setSearchResults([]);
    setSuggestions([]);
    await fetchFullSearchResults(query.trim());
  };

  // Handles clicking on a suggestion or result
  const handleSuggestionClick = useCallback(
    (drug: Drug) => {
      onDrugSelect(drug);
      setSearchResults([]);
      setQuery("");
      attemptFocus();
    },
    [onDrugSelect, attemptFocus]
  );

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <form onSubmit={handleSearch} role="search">
        <div
          className={`${styles.inputWrapper} ${
            isFocused ? styles.focused : ""
          }`}
        >
          <div className={styles.searchIconWrapper}>
            <FaSearch className={styles.searchIcon} aria-hidden="true" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const newQuery = e.target.value;
              setQuery(newQuery);
              setIsFocused(true);
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            placeholder="Search drugs..."
            className={styles.searchInput}
            aria-label="Search drugs"
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setSearchResults([]);
                setMessage(null);
                attemptFocus();
              }}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <FaTimes className={styles.clearIcon} aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`${styles.searchButton} ${
              isLoading ? styles.loading : ""
            }`}
            aria-label={isLoading ? "Searching..." : "Search"}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinnerDots} aria-hidden="true"></span>
                <FaArrowRight aria-hidden="true" />
              </>
            ) : (
              <>
                <span>Search</span>
                <FaArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {message && (
        <div className={`${styles.message} ${styles.error}`} role="status">
          {message}
        </div>
      )}

      {isFocused && suggestions.length > 0 && !searchResults.length && (
        <div
          id="search-suggestions"
          className={styles.suggestionsContainer}
          ref={suggestionsRef}
          role="listbox"
          aria-labelledby="search-input"
        >
          <ul className={styles.suggestionsList}>
            {suggestions.map((drug) => (
              <li
                key={`suggestion-${drug.id}`}
                className={styles.suggestionItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(drug)}
                role="option"
                aria-selected="false"
              >
                <div className={styles.suggestionContent}>
                  <span className={styles.drugName}>
                    {drug.name.replace(/-/g, " ")}
                  </span>
                  {drug.trade_name && (
                    <span className={styles.tradeName}>{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight
                  className={styles.suggestionIcon}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length > 0 && (
        <div
          className={styles.resultsContainer}
          role="region"
          aria-live="polite"
        >
          <h3 className={styles.resultsTitle} id="search-results-title">
            Search Results
          </h3>
          <ul
            className={styles.resultsList}
            aria-labelledby="search-results-title"
          >
            {searchResults.map((drug) => (
              <li
                key={`result-${drug.id}`}
                className={styles.resultItem}
                onClick={() => handleSuggestionClick(drug)}
                role="option"
                aria-selected="false"
              >
                <div className={styles.resultContent}>
                  <span className={styles.drugName}>
                    {drug.name.replace(/-/g, " ")}
                  </span>
                  {drug.trade_name && (
                    <span className={styles.tradeName}>{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight
                  className={styles.resultIcon}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";
export default SearchBar;
