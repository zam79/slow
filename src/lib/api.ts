import axios, { AxiosError } from "axios";
import { Drug } from "./types";

// Backend response interfaces (include last_updated)
interface BackendDrug {
  id: number;
  name: string;
  trade_name?: string | null;
  category: string;
  overview: string;
  dosing: string;
  pharmacokinetics: string;
  pharmacodynamics: string;
  clinical_practical_considerations: string;
  last_updated: string;
  is_emergency?: number;
  url?: string | null;
}

interface DrugResponse {
  success: boolean;
  data?: BackendDrug | null;
  message?: string | null;
}

interface DrugsResponse {
  success: boolean;
  data: BackendDrug[];
  count: number;
  total: number;
  message?: string | null;
}

interface CategoriesResponse {
  success: boolean;
  data: string[];
  message?: string | null;
}

interface CacheEntry {
  data: Drug | Drug[] | string[] | null;
  timestamp: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://drug-6.onrender.com/";
const SITEMAP_KEY = process.env.NEXT_PUBLIC_SITEMAP_KEY || "";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const TIMEOUT = 15000; // 15 seconds
const PAGE_LIMIT = 100; // Matches backend limit
const MAX_TOTAL_DRUGS = 1000; // Safety cap

const cache: { [key: string]: CacheEntry } = {};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Cache-Control": "public, max-age=3600",
  },
});

// Convert BackendDrug to Drug (remove last_updated)
const toFrontendDrug = (backendDrug: BackendDrug): Drug => ({
  id: backendDrug.id,
  name: backendDrug.name,
  trade_name: backendDrug.trade_name || undefined,
  category: backendDrug.category,
  overview: backendDrug.overview,
  dosing: backendDrug.dosing,
  pharmacokinetics: backendDrug.pharmacokinetics,
  pharmacodynamics: backendDrug.pharmacodynamics,
  clinical_practical_considerations:
    backendDrug.clinical_practical_considerations,
  is_emergency: backendDrug.is_emergency,
  url: backendDrug.url || undefined,
});

export const apiClient = {
  async searchDrugs(
    search: string = "",
    options: { limit?: number; offset?: number; fetchAll?: boolean } = {}
  ): Promise<Drug[]> {
    const { limit = PAGE_LIMIT, offset = 0, fetchAll = false } = options;
    const endpoint = search ? "/drugs/search" : "/drugs/";
    const cacheKey = `${endpoint}:${search}:limit:${limit}:offset:${offset}`;

    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const cachedData = cached.data as Drug[];
      if (!Array.isArray(cachedData)) {
        console.error(
          `Cached data for ${cacheKey} is not an array:`,
          cachedData
        );
        return [];
      }
      return cachedData;
    }

    if (fetchAll && !search) {
      const allDrugs: Drug[] = [];
      let currentOffset = 0;

      while (true) {
        const pageCacheKey = `/drugs/:limit:${PAGE_LIMIT}:offset:${currentOffset}`;
        const cached = cache[pageCacheKey];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          const cachedData = cached.data as Drug[];
          if (!Array.isArray(cachedData)) {
            console.error(
              `Cached data for ${pageCacheKey} is not an array:`,
              cachedData
            );
            return allDrugs;
          }
          allDrugs.push(...cachedData);
          currentOffset += PAGE_LIMIT;
          continue;
        }

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            const url = `/drugs/?limit=${PAGE_LIMIT}&offset=${currentOffset}`;
            const response = await axiosInstance.get<DrugsResponse>(url);
            if (!response.data.success) {
              console.error(`Error: ${response.data.message}`);
              return allDrugs;
            }
            if (!Array.isArray(response.data.data)) {
              console.error(
                "Response data is not an array:",
                response.data.data
              );
              return allDrugs;
            }
            const frontendDrugs = response.data.data.map(toFrontendDrug);
            cache[pageCacheKey] = {
              data: frontendDrugs,
              timestamp: Date.now(),
            };
            allDrugs.push(...frontendDrugs);
            if (
              response.data.count < PAGE_LIMIT ||
              allDrugs.length >= MAX_TOTAL_DRUGS
            ) {
              return allDrugs;
            }
            currentOffset += PAGE_LIMIT;
            break;
          } catch (error) {
            const axiosError = error as AxiosError;
            if (
              axiosError.response?.status === 429 ||
              axiosError.code === "ECONNABORTED"
            ) {
              if (retries < MAX_RETRIES - 1) {
                const delay = RETRY_DELAY * Math.pow(2, retries);
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
                continue;
              }
            }
            console.error("API error in searchDrugs:", axiosError.message);
            return allDrugs;
          }
        }
      }
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const url = search
          ? `${endpoint}?search=${encodeURIComponent(search)}&limit=${limit}`
          : `${endpoint}?limit=${limit}&offset=${offset}`;
        const response = await axiosInstance.get<DrugsResponse>(url);
        if (!response.data.success) {
          console.error(`Error: ${response.data.message}`);
          return [];
        }
        if (!Array.isArray(response.data.data)) {
          console.error("Response data is not an array:", response.data.data);
          return [];
        }
        const frontendDrugs = response.data.data.map(toFrontendDrug);
        cache[cacheKey] = { data: frontendDrugs, timestamp: Date.now() };
        return frontendDrugs;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 429 ||
          axiosError.code === "ECONNABORTED"
        ) {
          if (retries < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
            continue;
          }
        }
        console.error("API error in searchDrugs:", axiosError.message);
        return [];
      }
    }
    return [];
  },

  async getSitemapDrugs(): Promise<Drug[]> {
    const cacheKey = "sitemap";
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const cachedData = cached.data as Drug[];
      if (!Array.isArray(cachedData)) {
        console.error(
          `Cached data for ${cacheKey} is not an array:`,
          cachedData
        );
        return [];
      }
      return cachedData;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const url = "/drugs/sitemap";
        const response = await axiosInstance.get<BackendDrug[]>(url, {
          headers: {
            "X-Sitemap-Key": SITEMAP_KEY,
          },
        });
        const frontendDrugs = response.data.map(toFrontendDrug);
        cache[cacheKey] = { data: frontendDrugs, timestamp: Date.now() };
        return frontendDrugs;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 429 ||
          axiosError.response?.status === 401 ||
          axiosError.code === "ECONNABORTED"
        ) {
          if (retries < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
            continue;
          }
        }
        console.error("API error in getSitemapDrugs:", axiosError.message);
        return [];
      }
    }
    return [];
  },

  async getDrug(drugName: string): Promise<Drug | null> {
    const cacheKey = `drug:${drugName}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return (cached.data as Drug | null) || null;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const url = `/drugs/${encodeURIComponent(drugName)}`;
        const response = await axiosInstance.get<DrugResponse>(url);
        if (!response.data.success) {
          console.error(`Error: ${response.data.message}`);
          return null;
        }
        const frontendDrug = response.data.data
          ? toFrontendDrug(response.data.data)
          : null;
        cache[cacheKey] = { data: frontendDrug, timestamp: Date.now() };
        return frontendDrug;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 429 ||
          axiosError.code === "ECONNABORTED"
        ) {
          if (retries < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
            continue;
          }
        }
        console.error("API error in getDrug:", axiosError.message);
        return null;
      }
    }
    return null;
  },

  async getCategories(): Promise<string[]> {
    const cacheKey = "categories";
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const cachedData = cached.data as string[];
      if (!Array.isArray(cachedData)) {
        console.error(
          `Cached data for ${cacheKey} is not an array:`,
          cachedData
        );
        return [];
      }
      return cachedData;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const url = "/drugs/categories";
        const response = await axiosInstance.get<CategoriesResponse>(url);
        if (!response.data.success) {
          console.error(`Error: ${response.data.message}`);
          return [];
        }
        const categories = response.data.data;
        cache[cacheKey] = { data: categories, timestamp: Date.now() };
        return categories;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 429 ||
          axiosError.code === "ECONNABORTED"
        ) {
          if (retries < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
            continue;
          }
        }
        console.error("API error in getCategories:", axiosError.message);
        return [];
      }
    }
    return [];
  },

  async getDrugsByCategory(category: string): Promise<Drug[]> {
    const cacheKey = `category:${category}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const cachedData = cached.data as Drug[];
      if (!Array.isArray(cachedData)) {
        console.error(
          `Cached data for ${cacheKey} is not an array:`,
          cachedData
        );
        return [];
      }
      return cachedData;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const url = `/drugs/category/${encodeURIComponent(category)}`;
        const response = await axiosInstance.get<DrugsResponse>(url);
        if (!response.data.success) {
          console.error(`Error: ${response.data.message}`);
          return [];
        }
        if (!Array.isArray(response.data.data)) {
          console.error("Response data is not an array:", response.data.data);
          return [];
        }
        const frontendDrugs = response.data.data.map(toFrontendDrug);
        cache[cacheKey] = { data: frontendDrugs, timestamp: Date.now() };
        return frontendDrugs;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (
          axiosError.response?.status === 429 ||
          axiosError.code === "ECONNABORTED"
        ) {
          if (retries < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries++;
            continue;
          }
        }
        console.error("API error in getDrugsByCategory:", axiosError.message);
        return [];
      }
    }
    return [];
  },

  clearCache: () => {
    Object.keys(cache).forEach((key) => delete cache[key]);
  },
};
