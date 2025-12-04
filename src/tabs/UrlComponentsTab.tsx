import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, RefreshCw, Trash2 } from 'lucide-react';
import UrlSyncConfig from '../components/UrlSyncConfig';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Filter, { FilterConfig } from '../components/Filter';
import { userSyncUrlService } from '../services/userSyncUrlService';

interface ComponentItem {
  id: string;
  product_code: string;
  name: string;
  category: string;
  attributes: string;
  price: number;
  wholesale_price: number;
  brand: string;
  warranty: string;
  inventory: number;
  description: string;
  image: string;
  link: string;
}

const UrlComponentsTab: React.FC = () => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToday, setSyncToday] = useState(false);

  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState<string[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchComponents();
  }, [filters, searchTerm, sortConfig]);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('auth_token');
      const base = import.meta.env.VITE_API_BASE_URL;

      const params = new URLSearchParams();
      params.append('skip', String((pagination.page - 1) * pagination.limit));
      params.append('limit', String(pagination.limit));

      if (searchTerm) params.append('search', searchTerm);

      if (sortConfig) {
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
      }

      Object.entries(filters).forEach(([k, v]) => v && params.append(k, String(v)));

      const res = await fetch(`${base}/api/v1/user-components-from-url/my-components?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setComponents(data.data || []);
      setPagination((p) => ({ ...p, total: data.total, totalPages: data.totalPages }));

    } finally {
      setIsLoading(false);
    }
  };

  const syncNow = async () => {
    try {
      setIsSyncing(true);
      const res = await userSyncUrlService.syncDevices(syncToday, 'component');
      const json = res as any;
      const i = json.data || json;


      Swal.fire({
        icon: "success",
        title: "Đồng bộ thành công",
        html: `
          Tạo mới: ${i.created}<br/>
          Cập nhật: ${i.updated}<br/>
          Bỏ qua: ${i.skipped}<br/>
        `,
      });

      fetchComponents();
    } catch (err: any) {
      Swal.fire("Lỗi", err?.message || "Đồng bộ thất bại", "error");
    } finally {
      setIsSyncing(false);
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

  return (
    <div>
      <UrlSyncConfig isAuthenticated={true} defaultType="component" />

      <div className="flex gap-3 mt-2 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={syncToday} onChange={(e) => setSyncToday(e.target.checked)} />
          Nạp dữ liệu trong ngày
        </label>

        <button
          onClick={syncNow}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Danh sách linh kiện</h3>
        <Filter config={filterConfig} onFilterChange={setFilters} />
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
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.category}</td>
                  <td className="px-4 py-2">{c.attributes}</td>
                  <td className="px-4 py-2 text-right">{c.price.toLocaleString()} đ</td>
                  <td className="px-4 py-2 text-right">{c.wholesale_price.toLocaleString()} đ</td>
                  <td className="px-4 py-2">{c.brand}</td>
                  <td className="px-4 py-2">{c.warranty}</td>
                  <td className="px-4 py-2">{c.inventory}</td>
                  <td className="px-4 py-2 max-w-[250px] whitespace-normal">{c.description}</td>
                  <td className="px-4 py-2">
                    {c.image && <img src={c.image} className="w-12 h-12 rounded" />}
                  </td>
                  <td className="px-4 py-2">
                    <a href={c.link} target="_blank" className="text-blue-600 underline">Xem</a>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-red-600 flex items-center gap-1">
                      <Trash2 size={16} /> Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        />
      </div>

    </div>
  );
};

export default UrlComponentsTab;
