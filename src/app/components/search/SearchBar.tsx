"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import styles from "./search.module.css";
import { debounce } from "@/lib/debounce";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";

// Configuration constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const MIN_SEARCH_CHARS = 2; // Minimum characters before searching
const MAX_SUGGESTIONS = 10; // Max suggestions to show
const DEBOUNCE_DELAY = 300; // Debounce delay in ms

// Type for cached suggestions
type SuggestionCache = Record<
  string,
  {
    data: Drug[];
    timestamp: number;
  }
>;

interface SearchBarProps {
  onDrugSelect: (drug: Drug) => void; // New prop to handle drug selection
}

const SearchBar = memo(function SearchBar({ onDrugSelect }: SearchBarProps) {
  // State management
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cache, setCache] = useState<SuggestionCache>({});
  const [isMounted, setIsMounted] = useState(false);

  // Hooks and refs
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Set isMounted after component mounts on client
  useEffect(() => {
    setIsMounted(true);
    console.log("SearchBar mounted", { styles: Object.keys(styles) });
    return () => console.log("SearchBar unmounted");
  }, []);

  /**
   * Clears all search state
   */
  const clearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setSearchResults([]);
    setIsLoading(false);
    setMessage(null);
  }, []);

  /**
   * Fetches search suggestions with caching
   */
  const fetchSuggestions = useCallback(
    async (search: string) => {
      if (search.length < MIN_SEARCH_CHARS) {
        setSuggestions([]);
        setIsLoading(false);
        setMessage(null);
        return;
      }

      const cacheKey = `suggestions:${search.toLowerCase()}`;

      // Check cache first
      if (
        cache[cacheKey] &&
        Date.now() - cache[cacheKey].timestamp < CACHE_DURATION
      ) {
        setSuggestions(cache[cacheKey].data);
        setIsLoading(false);
        setMessage(null);
        return;
      }

      try {
        setIsLoading(true);
        const results = await apiClient.searchDrugs(search);
        console.log("Suggestions fetched:", results);
        const limitedResults = results.slice(0, MAX_SUGGESTIONS);

        setCache((prev) => ({
          ...prev,
          [cacheKey]: {
            data: limitedResults,
            timestamp: Date.now(),
          },
        }));

        setSuggestions(limitedResults);
        setMessage(
          limitedResults.length === 0 ? "No suggestions found." : null
        );
      } catch (error) {
        console.error("API Error in suggestions:", error, {
          query: search,
          url: process.env.NEXT_PUBLIC_API_URL,
        });
        setSuggestions([]);
        setMessage(
          error instanceof Error
            ? `Error: ${error.message}`
            : "Failed to fetch suggestions. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  /**
   * Fetches complete search results
   */
  const fetchFullSearchResults = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      setMessage(null);

      const results = await apiClient.searchDrugs(search);
      console.log("Full search results fetched:", results);
      const sortedResults = [...results].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setSearchResults(sortedResults);
      setMessage(
        sortedResults.length === 0
          ? "No results found. Please refine your search."
          : null
      );
    } catch (error) {
      console.error("API Error in full search:", error, {
        query: search,
        url: process.env.NEXT_PUBLIC_API_URL,
      });
      setSearchResults([]);
      setMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to fetch results. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (query.trim() && isMounted) {
      setIsLoading(true);
      debouncedFetchRef.current?.(query);
    } else {
      clearSearch();
    }
  }, [query, clearSearch, isMounted]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handles search form submission
   */
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

  /**
   * Handles clicking on a suggestion
   */
  const handleSuggestionClick = useCallback(
    (drug: Drug) => {
      onDrugSelect(drug); // Pass selected drug to parent
      clearSearch(); // Clear search input and suggestions
      setIsFocused(false); // Hide suggestions
    },
    [onDrugSelect, clearSearch]
  );

  // Render minimal UI until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={styles.searchContainer}>
        <form role="search">
          <div className={styles.inputWrapper}>
            <div className={styles.searchIconWrapper}>
              <FaSearch className={styles.searchIcon} aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search drugs..."
              className={styles.searchInput}
              aria-label="Search drugs"
              disabled
            />
            <button
              type="submit"
              disabled
              className={styles.searchButton}
              aria-label="Search"
            >
              <span>Search</span>
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    );
  }

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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search drugs..."
            className={styles.searchInput}
            aria-label="Search drugs"
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
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
                onClick={() => handleSuggestionClick(drug)} // Use same handler for consistency
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
