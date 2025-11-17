// StorageTable.tsx
import React from 'react';
import { Edit, Trash2, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { DeviceStorage } from '../../../types';
import { Pagination } from '../../common/Pagination';
import { StorageToolbar } from '../storage/StorageToolBar';

interface StorageTableProps {
  storages: DeviceStorage[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  selectAll: boolean;
  selectedCount: number;
  pagination: any;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onEditStorage?: (storage: DeviceStorage) => void;
  onDeleteStorage?: (storage: DeviceStorage) => void;
  onAddNew: () => void;
  onDeleteSelected: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const StorageTable: React.FC<StorageTableProps> = ({
  storages = [],
  onSelectAll,
  onSelectItem,
  selectAll,
  selectedCount,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onEditStorage,
  onDeleteStorage,
  onAddNew,
  onDeleteSelected,
  searchTerm,
  onSearchChange,
}) => {
  const [expandedStorage, setExpandedStorage] = React.useState<string | null>(null);

  const toggleExpand = (storageId: string) => {
    setExpandedStorage(expandedStorage === storageId ? null : storageId);
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(1)}TB`;
    }
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(0)}TB`;
    }
    return `${capacity}GB`;
  };

  const getStorageColor = (capacity: number) => {
    if (capacity >= 1000) return 'from-purple-500 to-pink-600';
    if (capacity >= 512) return 'from-blue-500 to-purple-600';
    if (capacity >= 256) return 'from-green-500 to-blue-600';
    return 'from-gray-500 to-green-600';
  };

  const getStorageIcon = (capacity: number) => {
    if (capacity >= 1000) return 'TB';
    if (capacity >= 512) return '512';
    if (capacity >= 256) return '256';
    return 'GB';
  };

  const getStorageType = (capacity: number) => (capacity >= 1000 ? 'Terabyte' : 'Gigabyte');

  const totalItems = pagination?.totalItems ?? 0;
  const uiPagination = {
    ...pagination,
    totalItems,
  };

  if (totalItems === 0 && searchTerm === '') {
    return (
      <div className="space-y-4">
        <StorageToolbar
          onAddNew={onAddNew}
          onDeleteSelected={onDeleteSelected}
          selectedCount={selectedCount}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-700">Dung lượng</div>
            <div className="text-xs text-gray-500">Tổng: 0</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm">Không có dung lượng nào</div>
            <button
              onClick={onAddNew}
              className="mt-4 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Thêm dung lượng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StorageToolbar
        onAddNew={onAddNew}
        onDeleteSelected={onDeleteSelected}
        selectedCount={selectedCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <button
              onClick={() => onSelectAll(!selectAll)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {selectAll ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
              <span>Chọn tất cả</span>
            </button>
            {selectedCount > 0 && (
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">
                {selectedCount} đã chọn
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">Tổng: {totalItems} dung lượng</div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-4"></th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dung lượng
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {storages.map((storage) => {
                const id = String((storage as any).id || (storage as any).storage_id || (storage as any).device_storage_id || '');
                const capacity = Number((storage as any).capacity ?? 0);
                const selected = Boolean((storage as any).selected);
                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectItem(id, e.target.checked);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getStorageColor(capacity)} rounded-xl flex items-center justify-center shadow-sm`}>
                          <span className="text-white font-bold text-sm">{getStorageIcon(capacity)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xl">{formatCapacity(capacity)}</div>
                          <div className="text-sm text-gray-500 mt-1">{getStorageType(capacity)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onEditStorage?.({ ...storage, id } as DeviceStorage); 
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline">Sửa</span>
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onDeleteStorage?.({ ...storage, id } as DeviceStorage); 
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Xóa</span>
                        </button>
                        <button
                          onClick={() => toggleExpand(id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                          title="Xem thêm"
                        >
                          <MoreVertical size={16} />
                          <span className="hidden sm:inline">Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="hidden md:block lg:hidden">
          <div className="divide-y divide-gray-200">
            {storages.map((storage) => {
              const id = String((storage as any).id || (storage as any).storage_id || (storage as any).device_storage_id || '');
              const capacity = Number((storage as any).capacity ?? 0);
              const selected = Boolean((storage as any).selected);
              return (
                <div key={id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectItem(id, e.target.checked);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div className={`w-12 h-12 bg-gradient-to-br ${getStorageColor(capacity)} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-white font-bold text-sm">{getStorageIcon(capacity)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-xl">{formatCapacity(capacity)}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-sm text-gray-600">{getStorageType(capacity)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onEditStorage?.({ ...storage, id } as DeviceStorage); 
                        }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onDeleteStorage?.({ ...storage, id } as DeviceStorage); 
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="block md:hidden">
          <div className="divide-y divide-gray-200">
            {storages.map((storage) => {
              const id = String((storage as any).id || (storage as any).storage_id || (storage as any).device_storage_id || '');
              const capacity = Number((storage as any).capacity ?? 0);
              const selected = Boolean((storage as any).selected);
              return (
                <div key={id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectItem(id, e.target.checked);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-1"
                      />
                      <div className={`w-10 h-10 bg-gradient-to-br ${getStorageColor(capacity)} rounded-lg flex items-center justify-center shadow-sm`}>
                        <span className="text-white font-bold text-xs">{getStorageIcon(capacity)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{formatCapacity(capacity)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-gray-600">{getStorageType(capacity)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onEditStorage?.({ ...storage, id } as DeviceStorage); 
                        }}
                        className="p-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onDeleteStorage?.({ ...storage, id } as DeviceStorage); 
                        }}
                        className="p-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={() => toggleExpand(id)}
                        className="p-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                        title="Xem thêm"
                      >
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </div>

                  {expandedStorage === id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dung lượng:</span>
                        <span className="text-gray-900 font-medium">{formatCapacity(capacity)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Pagination
            pagination={uiPagination}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
};