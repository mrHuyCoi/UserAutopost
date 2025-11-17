// components/tabs/DeviceTabs.tsx
import React from 'react';
import { SubTabType, UserDevice, DeviceInfo, Color, DeviceStorage, DeviceColorLink} from '../../types';
import { MyDevicesTable } from '../tables/mydevice/MyDevicesTable';
import DeviceInfoTable from '../tables/device/DeviceInfoTable';
import { ColorsTable } from '../tables/color/ColorsTable';
import { StorageTable } from '../tables/storage/StorageTable';
import { DeviceColorsTable } from '../tables/devicecolor/DeviceColorsTable';
import { DeviceInfoToolbar } from '../tables/DeviceInfoToolbar';

interface DeviceTabsProps {
  activeSubTab: SubTabType;
  onTabChange: (tab: SubTabType) => void;
  userDevices: UserDevice[];
  deviceInfos: DeviceInfo[];
  colors: Color[];
  storages: DeviceStorage[];
  onEdit?: (device: UserDevice) => void;
  reloadUserDevices: () => void;

  userDevicesPagination: any;
  deviceInfosPagination: any;
  colorsPagination: any;
  storagesPagination: any;
  materialsPagination: any;
  brandsPagination: any;

  onSelectAllUserDevices: (checked: boolean) => void;
  onSelectUserDeviceItem: (id: string, checked: boolean) => void;
  selectAllUserDevices: boolean;
  selectedUserDevicesCount: number;

  onSelectAllDeviceInfos: (checked: boolean) => void;
  onSelectDeviceInfoItem: (id: string, checked: boolean) => void;
  selectAllDeviceInfos: boolean;
  selectedDeviceInfosCount: number;

  onSelectAllColors: (checked: boolean) => void;
  onSelectColorItem: (id: string, checked: boolean) => void;
  selectAllColors: boolean;
  selectedColorsCount: number;

  onSelectAllStorages: (checked: boolean) => void;
  onSelectStorageItem: (id: string, checked: boolean) => void;
  selectAllStorages: boolean;
  selectedStoragesCount: number;

  onSelectAllMaterials: (checked: boolean) => void;
  onSelectMaterialItem: (id: string, checked: boolean) => void;
  selectAllMaterials: boolean;
  selectedMaterialsCount: number;

  onSelectAllBrands: (checked: boolean) => void;
  onSelectBrandItem: (id: string, checked: boolean) => void;
  selectAllBrands: boolean;
  selectedBrandsCount: number;

  onEditDeviceInfo: (device: DeviceInfo) => void;
  onDeleteDeviceInfo: (id: string) => void;
  onImportDeviceInfos: () => void;
  onExportDeviceInfos: () => void;
  onExportTemplate: () => void;
  onDeleteSelectedDeviceInfos: () => void;
  onDeleteAllDeviceInfos: () => void;
  reloadDeviceInfos: () => void;
  onAddNewDeviceInfo: () => void;
  onSearchDeviceInfos: (term: string) => void;
  deviceInfoSearchTerm: string;

  deviceInfoBrands: string[];
  selectedDeviceInfoBrand: string;
  onDeviceInfoBrandChange: (brand: string) => void;

  onAddNewColor: () => void;
  onDeleteSelectedColors: () => void;
  onSearchColors: (term: string) => void;
  colorSearchTerm: string;
  onEditColor: (color: Color) => void;
  onDeleteColor: (color: Color) => void;

  onAddNewStorage: () => void;
  onDeleteSelectedStorages: () => void;
  onSearchStorages: (term: string) => void;
  storageSearchTerm: string;
  onEditStorage: (storage: DeviceStorage) => void;
  onDeleteStorage: (storage: DeviceStorage) => void;

  onAddNewMyDevice: () => void;
  onDeleteSelectedMyDevices: () => void;
  onSearchMyDevices: (term: string) => void;
  myDeviceSearchTerm: string;
  onImportMyDevices: () => void;
  onExportMyDevices: () => void;
  onDownloadMyDevicesTemplate: () => void;
  onDeleteAllMyDevices: () => void;
  onRestoreMyDevices: () => void;

  // Device Colors props
  deviceColors: DeviceColorLink[];
  deviceColorsPagination: any;
  onSelectAllDeviceColors: (checked: boolean) => void;
  onSelectDeviceColorItem: (id: string, checked: boolean) => void;
  selectAllDeviceColors: boolean;
  selectedDeviceColorsCount: number;
  onDeleteDeviceColor: (id: string) => void;
  onSearchDeviceColors: (term: string) => void;
  deviceColorSearchTerm: string;
  onAddDeviceColorLink: () => void;
}

export const DeviceTabs: React.FC<DeviceTabsProps> = ({
  activeSubTab,
  onTabChange,
  userDevices,
  deviceInfos,
  colors,
  storages,

  userDevicesPagination,
  deviceInfosPagination,
  colorsPagination,
  storagesPagination,

  onSelectAllUserDevices,
  onSelectUserDeviceItem,
  selectAllUserDevices,
  selectedUserDevicesCount,

  onSelectAllDeviceInfos,
  onSelectDeviceInfoItem,
  selectAllDeviceInfos,
  selectedDeviceInfosCount,

  onSelectAllColors,
  onSelectColorItem,
  selectAllColors,
  selectedColorsCount,

  onSelectAllStorages,
  onSelectStorageItem,
  selectAllStorages,
  selectedStoragesCount,

  reloadUserDevices,
  onEdit,

  onEditDeviceInfo,
  onDeleteDeviceInfo,
  onImportDeviceInfos,
  onExportDeviceInfos,
  onExportTemplate,
  onDeleteSelectedDeviceInfos,
  onDeleteAllDeviceInfos,
  onAddNewDeviceInfo,
  onSearchDeviceInfos,
  deviceInfoSearchTerm,

  deviceInfoBrands,
  selectedDeviceInfoBrand,
  onDeviceInfoBrandChange,

  onAddNewColor,
  onDeleteSelectedColors,
  onSearchColors,
  colorSearchTerm,
  onEditColor,
  onDeleteColor,

  onAddNewStorage,
  onDeleteSelectedStorages,
  onSearchStorages,
  storageSearchTerm,
  onEditStorage,
  onDeleteStorage,

  onAddNewMyDevice,
  onDeleteSelectedMyDevices,
  onSearchMyDevices,
  myDeviceSearchTerm,
  onImportMyDevices,
  onExportMyDevices,
  onDownloadMyDevicesTemplate,
  onDeleteAllMyDevices,
  onRestoreMyDevices,

  // Device Colors props
  deviceColors,
  deviceColorsPagination,
  onSelectAllDeviceColors,
  onSelectDeviceColorItem,
  selectAllDeviceColors,
  selectedDeviceColorsCount,
  onDeleteDeviceColor,
  onSearchDeviceColors,
  deviceColorSearchTerm,
  onAddDeviceColorLink,
}) => {
  const tabs = [
    { id: 'my-devices' as SubTabType, label: 'Thiết bị của tôi' },
    { id: 'device-info' as SubTabType, label: 'Thông tin thiết bị' },
    { id: 'colors' as SubTabType, label: 'Màu sắc' },
    { id: 'device-colors' as SubTabType, label: 'Màu sắc thiết bị' },
    { id: 'storage' as SubTabType, label: 'Dung lượng' },
  ];

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const renderDeviceInfoContent = () => {
    const totalItems = deviceInfosPagination?.pagination?.totalItems ?? 0;

    if (totalItems === 0 && deviceInfoSearchTerm === '' && selectedDeviceInfoBrand === '') {
      return (
        <div className="space-y-4">
          <DeviceInfoToolbar
            selectedCount={selectedDeviceInfosCount}
            onImportClick={onImportDeviceInfos}
            onExportClick={onExportDeviceInfos}
            onTemplateClick={onExportTemplate}
            onDeleteSelectedClick={onDeleteSelectedDeviceInfos}
            onDeleteAllClick={onDeleteAllDeviceInfos}
            allBrands={deviceInfoBrands}
            selectedBrand={selectedDeviceInfoBrand}
            onBrandChange={onDeviceInfoBrandChange}
            onAddNewDeviceInfo={onAddNewDeviceInfo}
            deviceInfoSearchTerm={deviceInfoSearchTerm}
            onSearchDeviceInfos={onSearchDeviceInfos}
          />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium text-gray-700">Thông tin thiết bị</div>
              <div className="text-xs text-gray-500">Tổng: 0</div>
            </div>
            <div className="p-8 text-center">
              <div className="text-gray-400 text-sm">Không có thông tin thiết bị nào</div>
              <button
                onClick={onAddNewDeviceInfo}
                className="mt-4 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
              >
                Thêm thông tin thiết bị
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <DeviceInfoToolbar
          selectedCount={selectedDeviceInfosCount}
          onImportClick={onImportDeviceInfos}
          onExportClick={onExportDeviceInfos}
          onTemplateClick={onExportTemplate}
          onDeleteSelectedClick={onDeleteSelectedDeviceInfos}
          onDeleteAllClick={onDeleteAllDeviceInfos}
          allBrands={deviceInfoBrands}
          selectedBrand={selectedDeviceInfoBrand}
          onBrandChange={onDeviceInfoBrandChange}
          onAddNewDeviceInfo={onAddNewDeviceInfo}
          deviceInfoSearchTerm={deviceInfoSearchTerm}
          onSearchDeviceInfos={onSearchDeviceInfos}
        />
        <DeviceInfoTable
          devices={deviceInfos}
          onSelectAll={onSelectAllDeviceInfos}
          onSelectItem={onSelectDeviceInfoItem}
          selectAll={selectAllDeviceInfos}
          selectedCount={selectedDeviceInfosCount}
          pagination={deviceInfosPagination.pagination}
          onPageChange={deviceInfosPagination.handlePageChange}
          onItemsPerPageChange={deviceInfosPagination.handleItemsPerPageChange}
          onEditDevice={onEditDeviceInfo}
          onDeleteDevice={onDeleteDeviceInfo}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent z-10 md:hidden" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent z-10 md:hidden" />
        <div className="flex overflow-x-auto scrollbar-hide py-1 md:py-0 md:border-b md:border-gray-200 mb-4 md:mb-6">
          <div className="flex min-w-max space-x-1 px-2 md:px-0 md:space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative px-4 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-lg md:rounded-none md:border-b-2 mx-1 md:mx-0 flex-shrink-0 min-w-[120px] md:min-w-auto ${
                  activeSubTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-blue-500 md:bg-transparent md:border-blue-500 shadow-sm md:shadow-none'
                    : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100 md:bg-transparent md:hover:text-gray-900 md:hover:border-gray-300'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
                {activeSubTab === tab.id && <div className="absolute inset-x-2 bottom-1 h-0.5 bg-blue-500 rounded-full md:hidden" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-2 md:px-0">
        {activeSubTab === 'my-devices' && (
          <div className="space-y-4 md:space-y-6">
            <MyDevicesTable
              devices={userDevices}
              onSelectAll={onSelectAllUserDevices}
              onSelectItem={onSelectUserDeviceItem}
              selectAll={selectAllUserDevices}
              selectedCount={selectedUserDevicesCount}
              pagination={userDevicesPagination.pagination}
              onPageChange={userDevicesPagination.handlePageChange}
              onItemsPerPageChange={userDevicesPagination.handleItemsPerPageChange}
              formatCurrency={formatCurrency}
              reloadData={reloadUserDevices}
              onEdit={onEdit}
              onAddNew={onAddNewMyDevice}
              onDeleteSelected={onDeleteSelectedMyDevices}
              searchTerm={myDeviceSearchTerm}
              onSearchChange={onSearchMyDevices}
              onImportExcel={onImportMyDevices}
              onExportExcel={onExportMyDevices}
              onDownloadTemplate={onDownloadMyDevicesTemplate}
              onDeleteAll={onDeleteAllMyDevices}
              onRestore={onRestoreMyDevices}
            />
          </div>
        )}

        {activeSubTab === 'device-info' && renderDeviceInfoContent()}

        {activeSubTab === 'colors' && (
          <div className="space-y-4 md:space-y-6">
            <ColorsTable
              colors={colors}
              onSelectAll={onSelectAllColors}
              onSelectItem={onSelectColorItem}
              selectAll={selectAllColors}
              selectedCount={selectedColorsCount}
              pagination={colorsPagination.pagination}
              onPageChange={colorsPagination.handlePageChange}
              onItemsPerPageChange={colorsPagination.handleItemsPerPageChange}
              onAddNew={onAddNewColor}
              onDeleteSelected={onDeleteSelectedColors}
              searchTerm={colorSearchTerm}
              onSearchChange={onSearchColors}
              onEditColor={onEditColor}
              onDeleteColor={onDeleteColor}
            />
          </div>
        )}

        {activeSubTab === 'device-colors' && (
          <div className="space-y-4 md:space-y-6">
            <DeviceColorsTable
              deviceColors={deviceColors}
              onSelectAll={onSelectAllDeviceColors}
              onSelectItem={onSelectDeviceColorItem}
              selectAll={selectAllDeviceColors}
              selectedCount={selectedDeviceColorsCount}
              pagination={deviceColorsPagination.pagination}
              onPageChange={deviceColorsPagination.handlePageChange}
              onItemsPerPageChange={deviceColorsPagination.handleItemsPerPageChange}
              onDeleteDeviceColor={onDeleteDeviceColor}
              searchTerm={deviceColorSearchTerm}
              onSearchChange={onSearchDeviceColors}
              onAddDeviceColorLink={onAddDeviceColorLink}
            />
          </div>
        )}

        {activeSubTab === 'storage' && (
          <div className="space-y-4 md:space-y-6">
            <StorageTable
              storages={storages}
              onSelectAll={onSelectAllStorages}
              onSelectItem={onSelectStorageItem}
              selectAll={selectAllStorages}
              selectedCount={selectedStoragesCount}
              pagination={storagesPagination.pagination}
              onPageChange={storagesPagination.handlePageChange}
              onItemsPerPageChange={storagesPagination.handleItemsPerPageChange}
              onAddNew={onAddNewStorage}
              onDeleteSelected={onDeleteSelectedStorages}
              searchTerm={storageSearchTerm}
              onSearchChange={onSearchStorages}
              onEditStorage={onEditStorage}
              onDeleteStorage={onDeleteStorage}
            />
          </div>
        )}
      </div>
    </div>
  );
};