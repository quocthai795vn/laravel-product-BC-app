import { useState } from 'react';
import { message } from 'antd';
import { bigcommerceApi } from '@/services/api';
import {
  StoreConnection,
  StoreConnectionForm,
  CategoryTree,
} from '@/types/store';

/**
 * Hook for managing BigCommerce store connections
 */
export const useStores = () => {
  const [stores, setStores] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all stores
   */
  const fetchStores = async (params?: {
    type?: 'source' | 'target';
    active_only?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bigcommerceApi.getStores(params);
      setStores(response.stores);
      return response.stores;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch stores';
      setError(errorMessage);
      message.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connect a new store
   */
  const connectStore = async (data: StoreConnectionForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bigcommerceApi.connectStore(data);
      message.success(response.message || 'Store connected successfully');

      // Refresh stores list
      await fetchStores();

      return response.store;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to connect store';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a store
   */
  const deleteStore = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bigcommerceApi.deleteStore(id);
      message.success(response.message || 'Store deleted successfully');

      // Refresh stores list
      await fetchStores();

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete store';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test store connection
   */
  const testConnection = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bigcommerceApi.testConnection(id);

      if (response.success) {
        message.success('Connection successful');
      } else {
        message.error('Connection failed');
      }

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to test connection';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get category trees for a store
   */
  const getCategoryTrees = async (id: number): Promise<CategoryTree[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await bigcommerceApi.getCategoryTrees(id);
      return response.trees;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch category trees';
      setError(errorMessage);
      message.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    stores,
    loading,
    error,
    fetchStores,
    connectStore,
    deleteStore,
    testConnection,
    getCategoryTrees,
  };
};
