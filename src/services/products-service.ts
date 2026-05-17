import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  CardProduct,
  CreditProduct,
  DepositProduct,
  PaginatedResponse,
} from '@/types';

// ============================================
// Products Service — Product Catalog API
// ============================================

/** Product category for listing */
type ProductCategory = 'cards' | 'credits' | 'deposits' | 'insurance';

/** Parameters for listing products */
interface GetProductsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  type?: string;
  brand?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Generic product update data */
interface ProductUpdateData {
  id: string;
  category: ProductCategory;
  name?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

/** Union type for any product */
type AnyProduct = CardProduct | CreditProduct | DepositProduct;

export const productsService = {
  /**
   * Get a list of products by category with optional filtering.
   * Categories: cards, credits, deposits, insurance.
   */
  async getProducts(
    category: ProductCategory,
    params?: GetProductsParams,
  ): Promise<ApiResponse<PaginatedResponse<AnyProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<AnyProduct>>>(
      `/products/${category}/list`,
      { params },
    );
  },

  /**
   * Update an existing product's configuration.
   * Accepts partial updates for any product category.
   */
  async updateProduct<T = AnyProduct>(data: ProductUpdateData): Promise<ApiResponse<T>> {
    return apiClient.put<ApiResponse<T>>('/products/update', { body: data });
  },
};
