import {useState} from 'react';
import {message} from 'antd';
import {categoryApi} from '@/services/api';
import {CategoryComparison, CompareCategoriesRequest,} from '@/types/category';

/**
 * Hook for managing category operations
 */
export const useCategories = () => {
  const [comparison, setComparison] = useState<CategoryComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Compare categories between source and target stores
   */
  const compareCategories = async (data: CompareCategoriesRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryApi.compareCategories(data);
      setComparison(response.comparison);
      message.success('Categories compared successfully');
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to compare categories';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get source categories
   */
  const getSourceCategories = async (storeId: number) => {
    setLoading(true);
    setError(null);

    try {
        return await categoryApi.getSourceCategories(storeId);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch source categories';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get target categories
   */
  const getTargetCategories = async (storeId: number) => {
    setLoading(true);
    setError(null);

    try {
        return await categoryApi.getTargetCategories(storeId);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch target categories';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset comparison data
   */
  const resetComparison = () => {
    setComparison(null);
    setError(null);
  };

  return {
    comparison,
    loading,
    error,
    compareCategories,
    getSourceCategories,
    getTargetCategories,
    resetComparison,
  };
};
