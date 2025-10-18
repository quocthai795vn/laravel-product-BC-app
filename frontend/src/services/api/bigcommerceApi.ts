import axiosInstance from '@/lib/axios';
import {
  StoreConnection,
  StoreConnectionForm,
  ConnectStoreResponse,
  StoresListResponse,
  CategoryTreesResponse,
  StoreInfo,
} from '@/types/store';
import { ApiResponse } from '@/types/api';

/**
 * BigCommerce Store Connection API
 */
export const bigcommerceApi = {
  /**
   * Connect a new BigCommerce store
   */
  async connectStore(data: StoreConnectionForm): Promise<ConnectStoreResponse> {
    const response = await axiosInstance.post<ConnectStoreResponse>('/bc/connect', data);
    return response.data;
  },

  /**
   * Get all connected stores
   */
  async getStores(params?: {
    type?: 'source' | 'target';
    active_only?: boolean;
  }): Promise<StoresListResponse> {
    const response = await axiosInstance.get<StoresListResponse>('/bc/stores', { params });
    return response.data;
  },

  /**
   * Get a single store by ID
   */
  async getStore(id: number): Promise<ApiResponse<StoreConnection>> {
    const response = await axiosInstance.get<ApiResponse<StoreConnection>>(`/bc/stores/${id}`);
    return response.data;
  },

  /**
   * Delete a store connection
   */
  async deleteStore(id: number): Promise<ApiResponse> {
    const response = await axiosInstance.delete<ApiResponse>(`/bc/stores/${id}`);
    return response.data;
  },

  /**
   * Test a store connection
   */
  async testConnection(id: number): Promise<ApiResponse<StoreInfo>> {
    const response = await axiosInstance.post<ApiResponse<StoreInfo>>(`/bc/stores/${id}/test`);
    return response.data;
  },

  /**
   * Get category trees for a store
   */
  async getCategoryTrees(id: number): Promise<CategoryTreesResponse> {
    const response = await axiosInstance.get<CategoryTreesResponse>(`/bc/stores/${id}/trees`);
    return response.data;
  },
};
