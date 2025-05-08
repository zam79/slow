// src/lib/api.ts
import axios from "axios";
import { Drug } from "./types";

type CacheData = Drug[] | string[];
interface CacheEntry {
  data: CacheData;
  timestamp: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://data.drugbit.info";
const cache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 60 * 60 * 1000;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;
const TIMEOUT = 10000; // Increased from 5000ms to 10000ms

export const apiClient = {
  async searchDrugs(
    search: string = "",
    options: { limit?: number; offset?: number; fetchAll?: boolean } = {}
  ): Promise<Drug[]> {
    const { limit = 100, offset = 0, fetchAll = false } = options;
    const cacheKey = `search:${search}:limit:${limit}:offset:${offset}`;

    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as Drug[];
    }

    if (fetchAll) {
      const allDrugs: Drug[] = [];
      let currentOffset = 0;
      const pageLimit = 100;
      const MAX_TOTAL_DRUGS = 1000;

      while (true) {
        const pageCacheKey = `search:${search}:limit:${pageLimit}:offset:${currentOffset}`;
        const cached = cache[pageCacheKey];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          allDrugs.push(...(cached.data as Drug[]));
          currentOffset += pageLimit;
          continue;
        }

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            const response = await axios.get<Drug[]>(`${API_BASE_URL}/drugs/`, {
              params: {
                search: search || undefined,
                limit: pageLimit,
                offset: currentOffset,
              },
              headers: { "Cache-Control": "public, max-age=3600" },
              timeout: TIMEOUT,
            });
            cache[pageCacheKey] = {
              data: response.data,
              timestamp: Date.now(),
            };
            allDrugs.push(...response.data);
            if (
              response.data.length < pageLimit ||
              allDrugs.length >= MAX_TOTAL_DRUGS
            ) {
              return allDrugs;
            }
            currentOffset += pageLimit;
            break;
          } catch (error) {
            if (
              axios.isAxiosError(error) &&
              (error.response?.status === 429 ||
                error.code === "ECONNABORTED") &&
              retries < MAX_RETRIES - 1
            ) {
              const delay = RETRY_DELAY * Math.pow(2, retries);
              console.warn(
                `Error (status: ${
                  error.response?.status || error.code
                }), retrying in ${delay}ms...`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              retries++;
              continue;
            }
            console.error("API error:", error);
            return [];
          }
        }
      }
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.get<Drug[]>(`${API_BASE_URL}/drugs/`, {
          params: {
            search: search || undefined,
            limit,
            offset,
          },
          headers: { "Cache-Control": "public, max-age=3600" },
          timeout: TIMEOUT,
        });
        cache[cacheKey] = { data: response.data, timestamp: Date.now() };
        return response.data;
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 429 || error.code === "ECONNABORTED") &&
          retries < MAX_RETRIES - 1
        ) {
          const delay = RETRY_DELAY * Math.pow(2, retries);
          console.warn(
            `Error (status: ${
              error.response?.status || error.code
            }), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
          continue;
        }
        console.error("API error:", error);
        return [];
      }
    }
    return [];
  },

  async getDrug(drugName: string): Promise<Drug | null> {
    const cacheKey = `drug:${drugName}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return (cached.data as Drug[])[0] || null;
    }
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.get<Drug[]>(`${API_BASE_URL}/drugs/`, {
          params: { search: drugName },
          headers: { "Cache-Control": "public, max-age=3600" },
          timeout: TIMEOUT,
        });
        const drugs = response.data;
        const drug = drugs.find(
          (d: Drug) => d.name.toLowerCase() === drugName.toLowerCase()
        );
        cache[cacheKey] = { data: drugs, timestamp: Date.now() };
        return drug || null;
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 429 || error.code === "ECONNABORTED") &&
          retries < MAX_RETRIES - 1
        ) {
          const delay = RETRY_DELAY * Math.pow(2, retries);
          console.warn(
            `Error (status: ${
              error.response?.status || error.code
            }), retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
          continue;
        }
        console.error("API error:", error);
        return null;
      }
    }
    return null;
  },

  async getCategories(): Promise<string[]> {
    const cacheKey = "categories";
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as string[];
    }
    try {
      const drugs = await this.searchDrugs("", { fetchAll: true });
      const categories = Array.from(
        new Set(drugs.map((drug: Drug) => drug.category).filter(Boolean))
      ).sort();
      cache[cacheKey] = { data: categories, timestamp: Date.now() };
      return categories;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  async getDrugsByCategory(category: string): Promise<Drug[]> {
    const cacheKey = `category:${category}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as Drug[];
    }
    try {
      const drugs = await this.searchDrugs("", { fetchAll: true });
      const categoryDrugs = drugs
        .filter(
          (drug: Drug) => drug.category.toLowerCase() === category.toLowerCase()
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      cache[cacheKey] = { data: categoryDrugs, timestamp: Date.now() };
      return categoryDrugs;
    } catch (error) {
      console.error("Failed to fetch drugs by category:", error);
      return [];
    }
  },
};
