export interface Component {
  id: string;
  code: string;
  name: string;
  category: string;
  attribute: string;
  retailPrice: number;
  wholesalePrice: number;
  brand: string;
  warranty: string;
  stock: number;
  description: string;
  deletedAt?: string;
  images?: string[]; // Sửa ở đây: form sẽ xử lý dưới dạng mảng string
  productLink?: string;
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
export interface ComponentManagementState {
  components: Component[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  
  categories: string[];
  brands: string[];
  stockStatuses: string[];
  
  showColumnSelector: boolean;
  showAdvancedFilter: boolean;
  showDeleteModal: boolean;
  showImageModal: boolean;
  selectedImage: string;
  currentImageIndex: number;
  expandedRows: Set<string>;
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  stockStatus: string;
  showDeleted: boolean;
  selectedComponents: string[];
  selectAll: boolean;
  columnConfig: ColumnConfig[];

  // === STATE MỚI CHO FORM ===
  showFormModal: 'add' | 'edit' | null;
  editingComponent: Component | null; // Dữ liệu cho form sửa
  isFormLoading: boolean; // Loading data cho form sửa
}