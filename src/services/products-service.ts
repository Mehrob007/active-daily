import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  CardProduct,
  CreditProduct,
  DepositProduct,
  PaginatedResponse,
} from '@/types';

type ProductCategory = 'cards' | 'credits' | 'deposits' | 'insurance';

interface GetProductsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  type?: string;
  brand?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProductUpdateData {
  id: string;
  category: ProductCategory;
  name?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

type AnyProduct = CardProduct | CreditProduct | DepositProduct;

export const productsService = {

  async getProducts(
    category: ProductCategory,
    params?: GetProductsParams,
  ): Promise<ApiResponse<PaginatedResponse<AnyProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<AnyProduct>>>(
      `/products/${category}/list`,
      { params },
    );
  },

  async updateProduct<T = AnyProduct>(data: ProductUpdateData): Promise<ApiResponse<T>> {
    return apiClient.put<ApiResponse<T>>('/products/update', { body: data });
  },
};
