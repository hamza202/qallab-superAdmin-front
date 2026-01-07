import { useApi } from '@/composables/useApi';

const api = useApi();

// API Response Types
export interface CategoryListItem {
  id: number;
  name: string;
  unit_name: string;
  taxes: string[];
  created_at: string;
  is_active: boolean;
  actions: {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
  };
}

export interface CategoryTreeItem {
  id: number;
  name: string;
  children: CategoryTreeItem[];
  taxes: CategoryTax[];
}

export interface CategoryTax {
  id: number;
  tax_name: string;
  tax_id: number;
  percentage: string;
  minimum: string | null;
  priority: number;
  priority_label: string;
  is_active: boolean;
}

export interface CategoryDetails {
  id: number;
  name: string;
  name_translations: {
    ar: string;
    en: string;
  };
  description: string;
  description_translations: {
    ar: string;
    en: string;
  };
  image: string | null;
  parent_id: number | null;
  parent_name: string | null;
  is_active: boolean;
  unit_id: number;
  unit_name: string;
  taxes: CategoryTax[];
}

export interface TableHeader {
  key: string;
  title: string;
}

export interface CategoryIndexResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: CategoryListItem[];
  pagination: {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
  };
  header_table: string;
  headers: TableHeader[];
  shownHeaders: TableHeader[];
  actions: {
    can_create: boolean;
  };
}

export interface CategoryShowResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: CategoryDetails;
}

export interface CategoryTreeResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: CategoryTreeItem[];
}

export interface CategoryConstantsResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    taxes: Array<{
      id: number;
      name: string;
      percentage: string;
    }>;
    units: Array<{
      id: number;
      name: string;
    }>;
    categories: Array<{
      id: number;
      name: string;
    }>;
  };
}

export interface CreateCategoryPayload {
  name_translations: {
    ar: string;
    en: string;
  };
  description_translations: {
    ar: string;
    en: string;
  };
  parent_id?: number | null;
  unit_id: number;
  image?: File | null;
  is_active: boolean;
  taxes: Array<{
    tax_id: number;
    percentage: string;
    minimum: string | null;
    priority: number;
    is_active: boolean;
  }>;
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  _method?: string;
}

// Categories Service
export const categoriesService = {
  /**
   * Get constants (taxes, units, categories)
   */
  async getConstants(): Promise<CategoryConstantsResponse> {
    return api.get<CategoryConstantsResponse>('/admin/api/categories/constants');
  },

  /**
   * Get paginated list of categories
   */
  async getCategories(params?: { per_page?: number; cursor?: string }): Promise<CategoryIndexResponse> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    
    const url = `/admin/api/categories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get<CategoryIndexResponse>(url);
  },

  /**
   * Get tree list of categories
   */
  async getCategoriesTree(): Promise<CategoryTreeResponse> {
    return api.get<CategoryTreeResponse>('/admin/api/categories/list');
  },

  /**
   * Get single category details
   */
  async getCategory(id: number): Promise<CategoryShowResponse> {
    return api.get<CategoryShowResponse>(`/admin/api/categories/${id}`);
  },

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryPayload): Promise<any> {
    // If image exists, use FormData
    if (data.image) {
      const formData = new FormData();
      formData.append('name_translations[ar]', data.name_translations.ar);
      formData.append('name_translations[en]', data.name_translations.en);
      formData.append('description_translations[ar]', data.description_translations.ar);
      formData.append('description_translations[en]', data.description_translations.en);
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
      formData.append('unit_id', data.unit_id.toString());
      formData.append('is_active', data.is_active ? '1' : '0');
      formData.append('image', data.image);
      
      // Add taxes
      data.taxes.forEach((tax, index) => {
        formData.append(`taxes[${index}][tax_id]`, tax.tax_id.toString());
        formData.append(`taxes[${index}][percentage]`, tax.percentage);
        if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
        formData.append(`taxes[${index}][priority]`, tax.priority.toString());
        formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
      });

      return api.upload('/admin/api/categories', formData);
    }

    // Otherwise use JSON
    return api.post('/admin/api/categories', data);
  },

  /**
   * Update existing category
   */
  async updateCategory(id: number, data: UpdateCategoryPayload): Promise<any> {
    // If image exists, use FormData with _method=PUT
    if (data.image) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name_translations[ar]', data.name_translations.ar);
      formData.append('name_translations[en]', data.name_translations.en);
      formData.append('description_translations[ar]', data.description_translations.ar);
      formData.append('description_translations[en]', data.description_translations.en);
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
      formData.append('unit_id', data.unit_id.toString());
      formData.append('is_active', data.is_active ? '1' : '0');
      formData.append('image', data.image);
      
      // Add taxes
      data.taxes.forEach((tax, index) => {
        formData.append(`taxes[${index}][tax_id]`, tax.tax_id.toString());
        formData.append(`taxes[${index}][percentage]`, tax.percentage);
        if (tax.minimum) formData.append(`taxes[${index}][minimum]`, tax.minimum);
        formData.append(`taxes[${index}][priority]`, tax.priority.toString());
        formData.append(`taxes[${index}][is_active]`, tax.is_active ? '1' : '0');
      });

      return api.upload(`/admin/api/categories/${id}`, formData);
    }

    // Otherwise use JSON with PUT
    return api.put(`/admin/api/categories/${id}`, data);
  },

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<any> {
    return api.delete(`/admin/api/categories/${id}`);
  },

  /**
   * Bulk delete categories
   */
  async bulkDeleteCategories(ids: number[]): Promise<any> {
    return api.post('/admin/api/categories/bulk-delete', { ids });
  },

  /**
   * Change category status
   */
  async changeCategoryStatus(id: number): Promise<any> {
    return api.post(`/admin/api/categories/${id}/change-status`);
  },
};
