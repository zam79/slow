import axios, { AxiosError } from "axios";
import { Drug } from "@/lib/types";

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Interface for search options
interface SearchDrugsOptions {
  limit?: number;
  offset?: number;
  fetchAll?: boolean;
  signal?: AbortSignal;
}

// Interface for API error response
interface ApiErrorResponse {
  success: false;
  message: string;
}

// Interface for API client methods
interface ApiClient {
  searchDrugs(query: string, options?: SearchDrugsOptions): Promise<Drug[]>;
  getDrug(drugId: number, signal?: AbortSignal): Promise<Drug>;
  getDrugByName(drugName: string, signal?: AbortSignal): Promise<Drug | null>;
  getSitemapLight(): Promise<Drug[]>;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient: ApiClient = {
  async searchDrugs(query: string, options: SearchDrugsOptions = {}): Promise<Drug[]> {
    const { limit = 10, offset = 0, fetchAll = false, signal } = options;
    try {
      const params: Record<string, string | number> = { search: query.trim() };
      if (!fetchAll) {
        params.limit = Math.min(limit, 100);
        params.offset = offset;
      }

      const response = await axiosInstance.get<{ success: boolean; data: Drug[]; count: number; total: number }>(
        "/drugs/search",
        {
          params,
          signal,
        }
      );

      if (!response.data.success) {
        throw new Error("Search request failed");
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.name === "CanceledError") {
          throw new Error("Request canceled");
        }
        if (error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new Error(errorData.message || `HTTP ${error.response.status}: Failed to fetch drugs`);
        }
        throw new Error(error.message || "Network error");
      }
      throw error;
    }
  },

  async getDrug(drugId: number, signal?: AbortSignal): Promise<Drug> {
    try {
      const response = await axiosInstance.get<Drug | ApiErrorResponse>(`/drugs/${drugId}`, { signal });

      if ("success" in response.data && !response.data.success) {
        throw new Error((response.data as ApiErrorResponse).message || "Drug not found");
      }

      return response.data as Drug;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.name === "CanceledError") {
          throw new Error("Request canceled");
        }
        if (error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new Error(errorData.message || `HTTP ${error.response.status}: Failed to fetch drug`);
        }
        throw new Error(error.message || "Network error");
      }
      throw error;
    }
  },

  async getDrugByName(drugName: string, signal?: AbortSignal): Promise<Drug | null> {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: Drug }>(
        `/drugs/name/${encodeURIComponent(drugName)}`,
        { signal }
      );

      if (!response.data.success) {
        throw new Error("Drug not found");
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.name === "CanceledError") {
          throw new Error("Request canceled");
        }
        if (error.response?.status === 404) {
          return null;
        }
        if (error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new Error(errorData.message || `HTTP ${error.response.status}: Failed to fetch drug`);
        }
        throw new Error(error.message || "Network error");
      }
      throw error;
    }
  },

  async getSitemapLight(): Promise<Drug[]> {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: Drug[] }>(
        "/drugs/sitemap",
        { params: { limit: 1000 } }
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch sitemap data");
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error("Sitemap error response:", error.response.data);
      }
      console.error("Sitemap fetch failed:", error);
      try {
        console.warn("Falling back to searchDrugs for sitemap data");
        const drugs = await apiClient.searchDrugs("%", { limit: 1000 });
        return drugs;
      } catch (fallbackError) {
        if (fallbackError instanceof AxiosError && fallbackError.response) {
          console.error("SearchDrugs fallback error response:", fallbackError.response.data);
        }
        console.error("Fallback searchDrugs failed:", fallbackError);
        return [];
      }
    }
  },
};
