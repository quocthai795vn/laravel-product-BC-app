import axiosInstance from '@/lib/axios';
import {
  CategoriesResponse,
  CompareCategoriesRequest,
  CompareCategoriesResponse,
} from '@/types/category';

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
};
