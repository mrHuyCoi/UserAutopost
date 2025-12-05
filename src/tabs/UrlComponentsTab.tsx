import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import UrlSyncConfig from '../components/UrlSyncConfig';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Filter, { FilterConfig } from '../components/Filter';
import { userSyncUrlService } from '../services/userSyncUrlService';
import { productComponentService } from '../services/productComponentService';
import ComponentFormModal from '../components/ComponentManagement/components/ComponentFormModal';
import { Component } from '../components/ComponentManagement/types';
interface ComponentItem {
  id: string;
  product_code: string;
  product_name: string;
  category: string;
  attributes: string;
  amount: number;
  wholesale_price: number;
  trademark: string;
  guarantee: string;
  stock: number;
  description: string;
  product_photo: string;
  product_link: string;
  properties: string;
}

const UrlComponentsTab: React.FC = () => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingToday, setIsSyncingToday] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncToday, setSyncToday] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState<string[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // --- STATE CHO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Fetch components and check if the user has synced
// Effect 1: Khi thay đổi filter/search/sort -> Reset về trang 1
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [filters, searchTerm, sortConfig]);

  // Effect 2: Khi page thay đổi HOẶC các dependency khác thay đổi -> Gọi API
  // Lưu ý: Effect 1 chạy sẽ kích hoạt Effect 2 do pagination.page thay đổi
  useEffect(() => {
    fetchComponents();
    checkHasSynced();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, searchTerm, sortConfig]);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('auth_token');
      const base = import.meta.env.VITE_API_BASE_URL;

      // Kiểm tra giá trị hợp lệ của pagination.page và pagination.limit
      const currentPage = Number(pagination.page) || 1;
      const currentLimit = Number(pagination.limit) || 15;

      const skip = (currentPage - 1) * currentLimit;

      const params = new URLSearchParams();
      params.append('skip', String(skip));
      params.append('limit', String(currentLimit));

      if (searchTerm) params.append('search', searchTerm);
      if (sortConfig) {
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
      }

      Object.entries(filters).forEach(([k, v]) => v && params.append(k, String(v)));

      const res = await fetch(`${base}/api/v1/product-components?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Không thể tải dữ liệu');
      const data = await res.json();

      // FIX 2: Tự tính toán totalPages nếu API trả về thiếu hoặc sai
      // Phòng trường hợp data.totalPages bị null
      const totalItems = Number(data.total) || 0;
      const calculatedTotalPages = data.totalPages 
          ? Number(data.totalPages) 
          : Math.ceil(totalItems / currentLimit);

      setComponents(data.data || []);
      setPagination((p) => ({ 
          ...p, 
          total: totalItems, 
          totalPages: calculatedTotalPages || 1 // Tối thiểu là 1 trang
      }));

    } catch (err) {
      console.error('Lỗi:', err);
      // Giữ nguyên dữ liệu cũ hoặc reset về rỗng tùy ý
      setComponents([]);
      Swal.fire('Lỗi', 'Không thể tải danh sách linh kiện', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkHasSynced = async () => {
    try {
      const syncUrl = await userSyncUrlService.get('component');
      if (syncUrl && syncUrl.is_active) {
        setHasSynced(true);
      }
    } catch (err) {
      console.error('Không thể kiểm tra trạng thái đồng bộ', err);
    }
  };

  const syncTodayData = async () => {
    try {
        setIsSyncingToday(true); // Bắt đầu xoay icon cho nút "Đồng bộ dữ liệu trong ngày"
        const res = await productComponentService.syncNowFromApi();
        showSyncResult(res);
        fetchComponents();
    } catch (err: any) {
        Swal.fire('Lỗi', err?.message || 'Đồng bộ thất bại', 'error');
    } finally {
        setIsSyncingToday(false); // Dừng xoay icon sau khi đồng bộ xong
    }
    };

    const syncAllData = async () => {
    try {
        setIsSyncingAll(true); // Bắt đầu xoay icon cho nút "Đồng bộ tất cả dữ liệu"
        const res = await productComponentService.syncFromApi();
        showSyncResult(res);
        fetchComponents();
    } catch (err: any) {
        Swal.fire('Lỗi', err?.message || 'Đồng bộ tất cả dữ liệu thất bại', 'error');
    } finally {
        setIsSyncingAll(false); // Dừng xoay icon sau khi đồng bộ xong
    }
    };

  const showSyncResult = (res: any) => {
    const detail = res?.data || res;
    const created = detail.created ?? 0;
    const updated = detail.updated ?? 0;
    const skipped = detail.skipped ?? 0;

    Swal.fire({
        icon: detail.errors?.length ? 'warning' : 'success',
        title: 'Kết quả đồng bộ',
        html: `
        Tạo mới: <b>${created.toLocaleString()}</b><br/>
        Cập nhật: <b>${updated.toLocaleString()}</b><br/>
        Bỏ qua: <b>${skipped.toLocaleString()}</b><br/>
        ${detail.errors?.length ? `<br/>Lỗi:<br/>${detail.errors.join('<br/>')}` : ''}
        `,
    });
  };

  const deleteAll = async () => {
    try {
      Swal.fire({
        icon: 'warning',
        title: 'Xóa toàn bộ dữ liệu?',
        text: 'Hành động này không thể hoàn tác!',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#e3342f',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await productComponentService.deleteAllProductComponents();
          Swal.fire('Đã xóa', 'Toàn bộ dữ liệu đã được xóa', 'success');
          fetchComponents();
          checkHasSynced();
        }
      });
    } catch (err: any) {
      Swal.fire('Lỗi', 'Không thể xóa dữ liệu', 'error');
    }
  };

  const filterConfig: FilterConfig[] = [
    { key: 'brand', label: 'Thương hiệu', type: 'select', options: brands.map((b) => ({ label: b, value: b })) },
    { key: 'price', label: 'Giá bán lẻ', type: 'range-number' },
    { key: 'wholesale_price', label: 'Giá bán buôn', type: 'range-number' },
    { key: 'inventory', label: 'Tồn kho', type: 'range-number' },
  ];

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="ml-2 opacity-60">↕</span>;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  const deleteComponent = async (id: string) => {
    try {
        Swal.fire({
        icon: 'warning',
        title: 'Xóa linh kiện?',
        text: 'Hành động này không thể hoàn tác!',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#e3342f',
        }).then(async (result) => {
        if (result.isConfirmed) {
            await productComponentService.deleteProductComponent(id);
            Swal.fire('Đã xóa', 'Linh kiện đã được xóa', 'success');
            fetchComponents();  // Tải lại danh sách linh kiện sau khi xóa
        }
        });
    } catch (err: any) {
        Swal.fire('Lỗi', 'Không thể xóa linh kiện', 'error');
    }
    };
    const handleEditClick = async (id: string) => {
        setIsModalOpen(true);
        setModalMode('edit');
        setIsModalLoading(true);
        try {
            // Lấy chi tiết mới nhất từ API để đảm bảo dữ liệu (đặc biệt là attributes) đầy đủ
            const data: any = await productComponentService.getProductComponentById(id);
            
            // Map dữ liệu từ API (snake_case) sang Form (camelCase)
            const mappedData: Component = {
                id: data.id,
                code: data.product_code,
                name: data.product_name,
                category: data.category,
                attribute: data.attributes, // Giữ nguyên chuỗi JSON, modal sẽ tự parse
                retailPrice: data.amount,
                wholesalePrice: data.wholesale_price,
                brand: data.trademark,
                warranty: data.guarantee,
                stock: data.stock,
                description: data.description,
                // Xử lý ảnh: API trả về string đơn, form cần mảng
                images: data.product_photo ? [data.product_photo] : [], 
                productLink: data.product_link
            };
            setEditingComponent(mappedData);
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
            Swal.fire("Lỗi", "Không thể lấy thông tin linh kiện", "error");
            setIsModalOpen(false);
        } finally {
            setIsModalLoading(false);
        }
      };
const handleModalSubmit = async (formData: Component) => {
    try {
        // Map dữ liệu từ Form (camelCase) sang API Payload (snake_case)
        const payload: any = {
            product_code: formData.code,
            name: formData.name,
            category: formData.category,
            attributes: formData.attribute, // Chuỗi JSON đã xử lý trong modal
            price: Number(formData.retailPrice),
            wholesale_price: Number(formData.wholesalePrice),
            trademark: formData.brand,
            guarantee: formData.warranty,
            stock: Number(formData.stock),
            description: formData.description,
            product_link: formData.productLink,
            product_photo: (formData.images?.length || 0) > 0 ? formData.images![0] : ""
        };

        if (modalMode === 'add') {
            await productComponentService.createProductComponent(payload);
            Swal.fire("Thành công", "Đã thêm linh kiện mới", "success");
        } else {
            if (!editingComponent?.id) return;
            await productComponentService.updateProductComponent(editingComponent.id, payload);
            Swal.fire("Thành công", "Đã cập nhật linh kiện", "success");
        }

        setIsModalOpen(false);
        fetchComponents(); // Refresh danh sách
    } catch (error: any) {
        console.error("Lỗi submit form:", error);
        Swal.fire("Lỗi", error.response?.data?.detail || "Có lỗi xảy ra khi lưu", "error");
        // Ném lỗi để modal biết không đóng form (nếu cần)
        throw error;
    }
  };

  return (
    <div>
      <UrlSyncConfig isAuthenticated={true} defaultType="component" />

      <div className="flex gap-3 mt-2 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={syncToday} onChange={(e) => setSyncToday(e.target.checked)} />
          Nạp dữ liệu trong ngày
        </label>

        <button
            onClick={syncTodayData} // Gọi syncTodayData
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            disabled={isSyncingToday} // Chỉ vô hiệu hóa nút khi đang đồng bộ
        >
            <RefreshCw className={`w-4 h-4 ${isSyncingToday ? 'animate-spin' : ''}`} />
            Đồng bộ dữ liệu trong ngày
            </button>

            <button
            onClick={syncAllData} // Gọi syncAllData
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
            disabled={isSyncingAll} // Chỉ vô hiệu hóa nút khi đang đồng bộ
            >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            Đồng bộ tất cả dữ liệu
            </button>

        {components.length > 0 && (
          <button
            onClick={deleteAll} // Gọi deleteAll
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
          >
            <Trash2 size={16} /> Xóa tất cả
          </button>
        )}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Danh sách linh kiện</h3>
        {/* <Filter config={filterConfig} onFilterChange={setFilters} /> */}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
          placeholder="Tìm kiếm theo tên hoặc mã SP..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto bg-white rounded-lg shadow max-h-[70vh]">
        <table className="min-w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
            <tr>
            {[
                ['product_code', 'Mã SP'],
                ['name', 'Tên sản phẩm'],
                ['category', 'Danh mục'],
                ['attributes', 'Thuộc tính'],
                ['price', 'Giá bán lẻ'],
                ['wholesale_price', 'Giá bán buôn'],
                ['brand', 'Thương hiệu'],
                ['warranty', 'Bảo hành'],
                ['inventory', 'Tồn kho'],
                ['description', 'Mô tả'],
                ['image', 'Ảnh'],
                ['link', 'Link SP'],
                ['action', 'Hành động'],
            ].map(([k, label]) => (
                <th
                key={k}
                onClick={() => k !== 'image' && k !== 'link' && k !== 'action' &&
                    setSortConfig({ key: k, direction: sortConfig?.direction === 'ascending' ? 'descending' : 'ascending' })
                }
                className="px-4 py-3 text-left font-medium uppercase tracking-wider cursor-pointer"
                >
                <div className="flex items-center gap-1">{label}{renderSortIcon(k)}</div>
                </th>
            ))}
            </tr>
        </thead>

        <tbody className="divide-y">
        {isLoading ? (
            <tr><td colSpan={13}><LoadingSpinner /></td></tr>
        ) : components.length === 0 ? (
            <tr><td colSpan={13} className="text-center py-4 text-gray-500">Không có dữ liệu</td></tr>
        ) : (
            components.map((c) => (
            <tr key={c.id}>
                <td className="px-4 py-2">{c.product_code}</td>
                <td className="px-4 py-2">{c.product_name}</td>
                <td className="px-4 py-2">{c.category}</td>
                <td className="px-4 py-2">{c.properties}</td>
                <td className="px-4 py-2 text-right">{c.amount?.toLocaleString() || 0} đ</td>
                <td className="px-4 py-2 text-right">{c.wholesale_price?.toLocaleString() || 0} đ</td>
                <td className="px-4 py-2">{c.trademark}</td>
                <td className="px-4 py-2">{c.guarantee}</td>
                <td className="px-4 py-2">{c.stock}</td>
                <td className="px-4 py-2 max-w-[250px] overflow-hidden text-ellipsis">
                    {c.description.length > 50 ? (
                        <button
                        onClick={() => alert(c.description)} // Hiển thị mô tả dài trong modal hoặc alert
                        className="text-blue-600 underline"
                        >
                        Xem
                        </button>
                    ) : (
                        c.description
                    )}
                </td>

                <td className="px-4 py-2">
                {c.product_photo && <img src={c.product_photo} className="w-12 h-12 rounded" />}
                </td>
                <td className="px-4 py-2">
                <a href={c.product_link} target="_blank" className="text-blue-600 underline">Xem</a>
                </td>
                <td className="px-4 py-2">
                  <div className='flex items-center gap-3 '> 
                    <button
                    onClick={() => handleEditClick(c.id)} // Gọi hàm sửa khi nhấn nút sửa
                    className="text-blue-600 flex items-center gap-1"
                    >
                    <Edit2 size={16} />
                    </button>
                    <button
                    onClick={() => deleteComponent(c.id)} // Gọi hàm xóa khi nhấn nút xóa
                    className="text-red-600 flex items-center gap-1 ml-2"
                    >
                    <Trash2 size={16} />
                    </button>
                  </div>
                    
                </td>
            </tr>
            ))
        )}
        </tbody>


        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination
        currentPage={Number(pagination.page)} // Ép kiểu hiển thị
        totalPages={Number(pagination.totalPages)} // Ép kiểu hiển thị
        onPageChange={(page) => {
            const pageNumber = Number(page); // Ép kiểu dữ liệu đầu vào
            if (!isNaN(pageNumber) && pageNumber > 0) {
            setPagination((p) => ({ ...p, page: pageNumber }));
            }
        }}
        />
        <ComponentFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        isLoading={isModalLoading}
        initialData={editingComponent}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        />
      </div>
    </div>
  );
};

export default UrlComponentsTab;
