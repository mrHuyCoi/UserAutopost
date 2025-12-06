import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, RefreshCw } from 'lucide-react';
import UrlSyncConfig from '../components/UrlSyncConfig';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Filter, { FilterConfig } from '../components/Filter';
import { userSyncUrlService } from '../services/userSyncUrlService';
import { UserDevice } from '../types/deviceTypes';
import { deviceInfoService } from '../services/deviceInfoService';

const UrlDevicesTab: React.FC = () => {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatedToday, setUpdatedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortConfig, setSortConfig] = useState<any>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({});
  const [brands, setBrands] = useState<string[]>([]);

// Effect 1: Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [searchTerm, filters, sortConfig]);

  // Effect 2: Gọi API khi page thay đổi (hoặc các điều kiện lọc thay đổi)
  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchTerm, filters, sortConfig]);

 const fetchDevices = async () => {
    try {
      setIsLoading(true);

      // --- SỬA ĐOẠN NÀY ---
      // Đảm bảo kiểu dữ liệu là Number
      const currentPage = Number(pagination.page) || 1;
      const currentLimit = Number(pagination.limit) || 15;
      const skip = (currentPage - 1) * currentLimit;
      
      const params = new URLSearchParams();
      params.append('skip', String(skip));
      params.append('limit', String(currentLimit));
      // --------------------

      if (searchTerm) params.append('search', searchTerm);
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, String(v)));
      if (sortConfig) {
        params.append('sort_by', sortConfig.key);
        params.append('sort_order', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
      }

      const base = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/api/v1/user-devices-from-url/my-devices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const result = data.data ?? [];

      result.forEach((d: any) => {
        d.deviceModel = d.device_name || d.device_info?.model || 'Unknown';
        d.colorName = d.color?.name || 'Unknown';
        d.storageCapacity = d.device_storage?.capacity || 0;
      });

      setDevices(result);
      // Cập nhật totalPages an toàn
      const totalItems = Number(data.total) || 0;
      setPagination((p) => ({ 
          ...p, 
          total: totalItems, 
          totalPages: data.totalPages ? Number(data.totalPages) : Math.ceil(totalItems / currentLimit)
      }));
    } catch (error) {
        console.error(error);
        Swal.fire("Lỗi", "Không thể tải danh sách thiết bị", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const syncNow = async () => {
    try {
      setIsSyncing(true);
      const res = await userSyncUrlService.syncDevices(updatedToday, 'device');

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

      fetchDevices();
    } catch (err: any) {
      Swal.fire("Lỗi", err?.message || "Đồng bộ thất bại", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const filterConfig: FilterConfig[] = [
    { key: "brand", label: "Hãng", type: "select", options: brands.map((b) => ({ label: b, value: b })) },
    { key: "price", label: "Giá bán lẻ", type: "range-number" },
    { key: "wholesale_price", label: "Giá bán buôn", type: "range-number" },
    { key: "inventory", label: "Tồn kho", type: "range-number" },
  ];

  const columnLabels: Record<string, string> = {
  product_code: "Mã SP",
  deviceModel: "Model",
  inventory: "Tồn kho",
  price: "Giá lẻ",
  wholesale_price: "Giá buôn",
  colorName: "Màu sắc",
  storageCapacity: "Dung lượng",
  device_type: "Loại thiết bị",
  device_condition: "Tình trạng",
  battery_condition: "Pin (%)",
  warranty: "Bảo hành",
  notes: "Ghi chú",
};

const columns = [
  'product_code',
  'deviceModel',
  'inventory',
  'price',
  'wholesale_price',
  'colorName',
  'storageCapacity',
  'device_type',
  'device_condition',
  'battery_condition',
  'warranty',
  'notes',
];


  return (
    <div>
      <UrlSyncConfig isAuthenticated={true} defaultType="device" />

      <div className="flex gap-4 mt-3 mb-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={updatedToday} onChange={(e) => setUpdatedToday(e.target.checked)} />
          Chỉ đồng bộ sản phẩm hôm nay
        </label>

        <button
          onClick={syncNow}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          {isSyncing ? <RefreshCw className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Danh sách thiết bị</h3>
        <Filter config={filterConfig} onFilterChange={setFilters} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="pl-10 pr-4 py-2 border rounded-lg w-full"
          placeholder="Tìm theo model hoặc mã SP..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-auto bg-white rounded-lg shadow max-h-[70vh] 
    scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 md:px-4 py-2 md:py-3 text-left font-medium cursor-pointer whitespace-nowrap"
                onClick={() =>
                  setSortConfig({
                    key: col,
                    direction: sortConfig?.direction === "ascending" ? "descending" : "ascending",
                  })
                }
              >
                {columnLabels[col] ?? col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          {isLoading ? (
            <tr><td colSpan={12}><LoadingSpinner /></td></tr>
          ) : devices.length === 0 ? (
            <tr><td colSpan={12} className="text-center py-4">Không có dữ liệu</td></tr>
          ) : (
            devices.map((d) => (
              <tr key={d.id}>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">{d.product_code}</td>
                <td className="px-2 md:px-4 py-2 max-w-[150px] truncate">{d.deviceModel}</td>
                <td className="px-2 md:px-4 py-2">{d.inventory}</td>
                <td className="px-2 md:px-4 py-2">{d.price}</td>
                <td className="px-2 md:px-4 py-2">{d.wholesale_price}</td>
                <td className="px-2 md:px-4 py-2">{d.colorName}</td>
                <td className="px-2 md:px-4 py-2">{d.storageCapacity} GB</td>
                <td className="px-2 md:px-4 py-2">{d.device_type}</td>
                <td className="px-2 md:px-4 py-2">{d.device_condition}</td>
                <td className="px-2 md:px-4 py-2">{d.battery_condition}</td>
                <td className="px-2 md:px-4 py-2">{d.warranty}</td>
                <td className="px-2 md:px-4 py-2 max-w-[160px] truncate">{d.notes}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>


      {/* PAGINATION */}
      <div className="mt-4 flex justify-end">
        <Pagination
          currentPage={Number(pagination.page)} // Ép kiểu
          totalPages={Number(pagination.totalPages)} // Ép kiểu
          onPageChange={(page) => {
             const pageNum = Number(page);
             if(!isNaN(pageNum) && pageNum > 0) {
                 setPagination((prev) => ({ ...prev, page: pageNum }));
             }
          }}
        />
      </div>
    </div>
  );
};

export default UrlDevicesTab;
