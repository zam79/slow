"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import { debounce } from "@/lib/debounce";
import { apiClient } from "@/lib/api";
import { Drug } from "@/lib/types";

const CACHE_DURATION = 15 * 60 * 1000;
const MIN_SEARCH_CHARS = 2;
const MAX_SUGGESTIONS = 10;
const DEBOUNCE_DELAY = 300;
const API_TIMEOUT = 5000;

type SuggestionCache = Record<
  string,
  { data: Drug[]; timestamp: number }
>;

interface SearchBarProps {
  onDrugSelect: (drug: Drug) => void;
  resetTrigger: number;
}

const SearchBar = memo(function SearchBar({
  onDrugSelect,
  resetTrigger,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Drug[]>([]);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cache, setCache] = useState<SuggestionCache>({});

  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const attemptFocus = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsFocused(true);
      }
    }, 100);
  }, []);

  useEffect(() => {
    attemptFocus();
    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [attemptFocus]);

  useEffect(() => {
    setQuery("");
    setSuggestions([]);
    setSearchResults([]);
    setIsLoading(false);
    setMessage(null);
    attemptFocus();
  }, [resetTrigger, attemptFocus]);

  useEffect(() => {
    if (query.trim() && !isFocused) {
      attemptFocus();
    }
  }, [query, isFocused, attemptFocus]);

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

        const results = await apiClient.searchDrugs(search, {
          limit: 100,
          signal: controller.signal,
        });
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

  useEffect(() => {
    debouncedFetchRef.current = debounce((search: string) => {
      fetchSuggestions(search);
    }, DEBOUNCE_DELAY);
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

  const fetchFullSearchResults = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      setMessage(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setMessage("Search timed out. Please try again.");
      }, API_TIMEOUT);

      const results = await apiClient.searchDrugs(search, {
        limit: 100,
        signal: controller.signal,
      });
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
    <div className="relative w-full max-w-3xl mx-auto z-[9000]" ref={containerRef}>
      <form onSubmit={handleSearch} role="search">
        <div
          className={`flex items-center bg-gradient-search rounded-2xl shadow-lg border-2 border-blue-900 overflow-visible transition-all duration-300 ease-in-out ${
            isFocused ? "border-teal-400 shadow-[0_6px_16px_rgba(45,212,191,0.2)] -translate-y-1" : ""
          }`}
        >
          <div className="flex items-center px-3">
            <FaSearch className="text-gray-500 text-xl" aria-hidden="true" />
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
            className="flex-1 border-none bg-transparent text-base py-3 text-blue-900 outline-none placeholder-gray-400"
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
              className="bg-none border-none px-3 cursor-pointer flex items-center"
              aria-label="Clear search"
            >
              <FaTimes className="text-gray-500 text-xl" aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`bg-gradient-button text-white px-6 py-3 rounded-xl border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:bg-gradient-button-hover hover:-translate-y-px focus:outline-none focus:shadow-[0_0_8px_rgba(45,212,191,0.3)] ${
              isLoading ? "cursor-not-allowed opacity-70" : ""
            }`}
            aria-label={isLoading ? "Searching..." : "Search"}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
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
        <div className="px-3 py-3 text-sm text-center text-red-600" role="status">
          {message}
        </div>
      )}

      {isFocused && suggestions.length > 0 && !searchResults.length && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl max-h-[300px] overflow-y-auto z-[9999]"
          ref={suggestionsRef}
          role="listbox"
          aria-labelledby="search-input"
        >
          <ul className="list-none m-0 p-0">
            {suggestions.map((drug) => (
              <li
                key={`suggestion-${drug.id}`}
                className="px-4 py-3 cursor-pointer text-sm text-blue-900 flex justify-between items-center hover:bg-gray-100"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(drug)}
                role="option"
                aria-selected="false"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {drug.name.replace(/-/g, " ")}
                  </span>
                  {drug.trade_name && (
                    <span className="text-xs text-gray-500">{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight
                  className="text-orange-400 text-sm"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length > 0 && (
        <div
          className="mt-4 bg-white rounded-lg shadow-xl p-4 z-[8000]"
          role="region"
          aria-live="polite"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-3" id="search-results-title">
            Search Results
          </h3>
          <ul
            className="list-none m-0 p-0"
            aria-labelledby="search-results-title"
          >
            {searchResults.map((drug) => (
              <li
                key={`result-${drug.id}`}
                className="px-3 py-3 cursor-pointer text-sm text-blue-900 flex justify-between items-center hover:bg-gray-100"
                onClick={() => handleSuggestionClick(drug)}
                role="option"
                aria-selected="false"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {drug.name.replace(/-/g, " ")}
                  </span>
                  {drug.trade_name && (
                    <span className="text-xs text-gray-500">{drug.trade_name}</span>
                  )}
                </div>
                <FaArrowRight
                  className="text-orange-400 text-sm"
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
