import axiosInstance from '@/lib/axios';
import {
  CategoriesResponse,
  CompareCategoriesRequest,
  CompareCategoriesResponse,
} from '@/types/category';

interface ExportCategoriesRequest {
  store_id: number;
  format: 'csv' | 'json';
}

interface ExportCategoriesResponse {
  success: boolean;
  data: any[];
  filename: string;
}

interface ImportCategoriesRequest {
  store_id: number;
  categories: any[];
}

interface ImportCategoriesResponse {
  success: boolean;
  message: string;
  results: {
    created: number;
    updated: number;
    failed: number;
    details: Array<{
      status: 'success' | 'failed';
      category_name: string;
      category_id?: number;
      message?: string;
    }>;
  };
}

/**
 * Category Management API
 */
export const categoryApi = {
  /**
   * Get categories from source store
   */
  async getSourceCategories(storeId: number): Promise<CategoriesResponse> {
    const response = await axiosInstance.get<CategoriesResponse>(
      `/categories/source/${storeId}`
    );
    return response.data;
  },

  /**
   * Get categories from target store
   */
  async getTargetCategories(storeId: number): Promise<CategoriesResponse> {
    const response = await axiosInstance.get<CategoriesResponse>(
      `/categories/target/${storeId}`
    );
    return response.data;
  },

  /**
   * Compare categories between source and target stores
   */
  async compareCategories(
    data: CompareCategoriesRequest
  ): Promise<CompareCategoriesResponse> {
    const response = await axiosInstance.post<CompareCategoriesResponse>(
      '/categories/compare',
      data
    );
    return response.data;
  },

  /**
   * Export categories from a store
   */
  async exportCategories(
    data: ExportCategoriesRequest
  ): Promise<ExportCategoriesResponse> {
    const response = await axiosInstance.post<ExportCategoriesResponse>(
      '/categories/export',
      data
    );
    return response.data;
  },

  /**
   * Import categories into a store
   */
  async importCategories(
    data: ImportCategoriesRequest
  ): Promise<ImportCategoriesResponse> {
    const response = await axiosInstance.post<ImportCategoriesResponse>(
      '/categories/import',
      data
    );
    return response.data;
  },
};
