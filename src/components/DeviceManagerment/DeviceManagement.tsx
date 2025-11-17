// DeviceManagement.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDeviceForms, usePagination, useSelection, useDeviceData } from './hooks';
import { DeviceTabs } from './components/tabs/DeviceTabs';
import { DeviceForm } from './components/forms/DeviceForm';
import { ColorForm } from './components/forms/ColorForm';
import { StorageForm } from './components/forms/StorageForm';
import { SubTabType, UserDevice, DeviceInfo, Color, DeviceStorage, Material, ImportResponse, DeviceInfoFormData, DeviceColorLink } from './types';
import LoadingSpinner from '../LoadingSpinner';
import { MyDeviceForm } from './components/forms/MyDeviceForm';
import { userDeviceService } from '../../services/userDeviceService';
import { deviceInfoService } from '../../services/deviceInfoService';
import { deviceApiService } from '../../services/deviceApiService';
import { colorService } from '../../services/colorService';
import { deviceStorageService } from '../../services/deviceStorageService';
import { deviceColorService } from '../../services/deviceColorService';

const DeviceManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('my-devices');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<UserDevice | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [restorableDevices, setRestorableDevices] = useState<UserDevice[]>([]);
  const [editingDeviceInfo, setEditingDeviceInfo] = useState<DeviceInfoFormData | null>(null);
  const [editingDeviceInfoId, setEditingDeviceInfoId] = useState<string | null>(null);
  const [showEditDeviceInfoForm, setShowEditDeviceInfoForm] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [editingStorage, setEditingStorage] = useState<DeviceStorage | null>(null);
  const [selectedDeviceInfoForStorage, setSelectedDeviceInfoForStorage] = useState<string>('');
  const [selectedDeviceIdForStorage, setSelectedDeviceIdForStorage] = useState<string>('');

  const {
    userDevices: initialUserDevices, setUserDevices: setInitialUserDevices,
    deviceInfos: initialDeviceInfos, setDeviceInfos: setInitialDeviceInfos,
    colors: initialColors, setColors: setInitialColors,
    storages, setStorages,
    materials, setMaterials,
    brands, setBrands,
    loading, error,
    refetch
  } = useDeviceData();
  
  // User Devices state riêng cho server-side pagination
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  
  // Device Infos state riêng cho server-side pagination
  const [deviceInfos, setDeviceInfos] = useState<DeviceInfo[]>([]);
  
  // Colors state riêng cho server-side pagination
  const [colors, setColors] = useState<Color[]>([]);

  const [myDeviceSearchTerm, setMyDeviceSearchTerm] = useState('');
  const [deviceInfoSearchTerm, setDeviceInfoSearchTerm] = useState('');
  const [colorSearchTerm, setColorSearchTerm] = useState('');
  const [storageSearchTerm, setStorageSearchTerm] = useState('');
  const [selectedDeviceInfoBrand, setSelectedDeviceInfoBrand] = useState('');
  
  // User Devices pagination state (server-side)
  const [userDevicesPaginationState, setUserDevicesPaginationState] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingUserDevices, setLoadingUserDevices] = useState(false);
  
  // Device Infos pagination state (server-side)
  const [deviceInfosPaginationState, setDeviceInfosPaginationState] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingDeviceInfos, setLoadingDeviceInfos] = useState(false);
  
  // Colors pagination state (server-side)
  const [colorsPaginationState, setColorsPaginationState] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingColors, setLoadingColors] = useState(false);
  
  // Device Colors state
  const [deviceColors, setDeviceColors] = useState<DeviceColorLink[]>([]);
  const [deviceColorSearchTerm, setDeviceColorSearchTerm] = useState('');
  const [deviceColorsPaginationState, setDeviceColorsPaginationState] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingDeviceColors, setLoadingDeviceColors] = useState(false);
  const [showAddDeviceColorModal, setShowAddDeviceColorModal] = useState(false);
  const [deviceInfoIdForLink, setDeviceInfoIdForLink] = useState<string>('');
  const [colorIdForLink, setColorIdForLink] = useState<string>('');
  const [creatingDeviceColorLink, setCreatingDeviceColorLink] = useState(false);
  const [deviceColorFormError, setDeviceColorFormError] = useState<string | null>(null);

  // User Devices không cần filter ở client vì đã được filter ở server
  const filteredUserDevices = userDevices;

  // Device Info Brands - cần fetch từ API hoặc giữ cache
  // Tạm thời giữ logic cũ nhưng có thể cần fetch riêng từ API
  const deviceInfoBrands = useMemo(() => {
    const brandSet = new Set(deviceInfos.map(d => d.brand).filter(Boolean) as string[]);
    return Array.from(brandSet).sort();
  }, [deviceInfos]);

  // Device Infos không cần filter ở client vì đã được filter ở server
  const filteredDeviceInfos = deviceInfos;

  // Colors không cần filter ở client vì đã được filter ở server
  const filteredColors = colors;

  const deviceInfoOptions = useMemo(
    () =>
      deviceInfos.map((info) => ({
        id: info.id,
        label: `${info.model}${info.brand ? ` - ${info.brand}` : ''}`,
      })),
    [deviceInfos]
  );

  const colorOptions = useMemo(
    () =>
      colors.map((color) => ({
        id: color.id,
        label: `${color.name}${color.hex_code ? ` (${color.hex_code})` : ''}`,
      })),
    [colors]
  );

  const normalizedStorages = useMemo(() => {
    return storages.map((s: any) => {
      const id = String(s.id ?? s.storage_id);
      return { ...s, id };
    });
  }, [storages]);

  const filteredStorages = useMemo(() => {
    return normalizedStorages.filter((s: any) =>
      String(s.capacity ?? '').includes(storageSearchTerm)
    );
  }, [normalizedStorages, storageSearchTerm]);

  const materialsPagination = usePagination(materials);
  const brandsPagination = usePagination(brands);
  // User Devices sử dụng server-side pagination
  const userDevicesPagination = {
    pagination: {
      currentPage: userDevicesPaginationState.pageNum,
      itemsPerPage: userDevicesPaginationState.pageSize,
      totalItems: userDevicesPaginationState.total,
      totalPages: userDevicesPaginationState.totalPages,
    },
    handlePageChange: (page: number) => {
      setUserDevicesPaginationState(prev => ({ ...prev, pageNum: page }));
    },
    handleItemsPerPageChange: (itemsPerPage: number) => {
      setUserDevicesPaginationState(prev => ({ ...prev, pageSize: itemsPerPage, pageNum: 1 }));
    },
  };
  // Device Infos sử dụng server-side pagination
  const deviceInfosPagination = {
    pagination: {
      currentPage: deviceInfosPaginationState.pageNum,
      itemsPerPage: deviceInfosPaginationState.pageSize,
      totalItems: deviceInfosPaginationState.total,
      totalPages: deviceInfosPaginationState.totalPages,
    },
    handlePageChange: (page: number) => {
      setDeviceInfosPaginationState(prev => ({ ...prev, pageNum: page }));
    },
    handleItemsPerPageChange: (itemsPerPage: number) => {
      setDeviceInfosPaginationState(prev => ({ ...prev, pageSize: itemsPerPage, pageNum: 1 }));
    },
  };
  // Colors sử dụng server-side pagination
  const colorsPagination = {
    pagination: {
      currentPage: colorsPaginationState.pageNum,
      itemsPerPage: colorsPaginationState.pageSize,
      totalItems: colorsPaginationState.total,
      totalPages: colorsPaginationState.totalPages,
    },
    handlePageChange: (page: number) => {
      setColorsPaginationState(prev => ({ ...prev, pageNum: page }));
    },
    handleItemsPerPageChange: (itemsPerPage: number) => {
      setColorsPaginationState(prev => ({ ...prev, pageSize: itemsPerPage, pageNum: 1 }));
    },
  };
  const storagesPagination = usePagination(filteredStorages);

  // User Devices đã được paginate ở server, không cần paginate lại ở client
  const paginatedUserDevices = userDevices;
  // Device Infos đã được paginate ở server, không cần paginate lại ở client
  const paginatedDeviceInfos = deviceInfos;
  // Colors đã được paginate ở server, không cần paginate lại ở client
  const paginatedColors = colors;
  const paginatedStorages = storagesPagination.getCurrentPageData();

  const userDevicesSelection = useSelection(filteredUserDevices, setUserDevices);
  const deviceInfosSelection = useSelection(filteredDeviceInfos, setDeviceInfos);
  const colorsSelection = useSelection(filteredColors, setColors);
  const materialsSelection = useSelection(materials, setMaterials);
  const brandsSelection = useSelection(brands, setBrands);
  
  // Device Colors selection
  const deviceColorsSelection = useSelection(deviceColors, setDeviceColors);

  const fetchRestorableDevices = async () => {
    if (activeSubTab === 'my-devices') {
      try {
        const response: any = await userDeviceService.getDeletedDevicesToday();
        let deletedList: UserDevice[] = response.data || response.devices || (Array.isArray(response) ? response : []);
        setRestorableDevices(deletedList);
      } catch {
        setRestorableDevices([]);
      }
    } else {
      setRestorableDevices([]);
    }
  };

  useEffect(() => {
    fetchRestorableDevices();
  }, [activeSubTab]);

  // Fetch user devices với server-side pagination
  const fetchUserDevices = async () => {
    setLoadingUserDevices(true);
    try {
      const skip = (userDevicesPaginationState.pageNum - 1) * userDevicesPaginationState.pageSize;
      const response = await deviceApiService.getUserDevices(
        undefined, // userId
        skip,
        userDevicesPaginationState.pageSize,
        myDeviceSearchTerm || undefined
      );
      const list = response.items || [];
      setUserDevices(list.map((item) => ({ ...item, selected: false })) as unknown as UserDevice[]);
      setUserDevicesPaginationState(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching user devices:', error);
      setUserDevices([]);
    } finally {
      setLoadingUserDevices(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'my-devices') {
      fetchUserDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, myDeviceSearchTerm, userDevicesPaginationState.pageNum, userDevicesPaginationState.pageSize]);

  // Fetch device infos với server-side pagination
  const fetchDeviceInfos = async () => {
    setLoadingDeviceInfos(true);
    try {
      const filter = {
        search: deviceInfoSearchTerm,
        brand: selectedDeviceInfoBrand || undefined,
      };
      const pagination = {
        page: deviceInfosPaginationState.pageNum,
        limit: deviceInfosPaginationState.pageSize,
      };
      const response = await deviceApiService.getDeviceInfos(filter, pagination);
      const list = response.items || [];
      setDeviceInfos(list.map((item: DeviceInfo) => ({ ...item, selected: false })));
      setDeviceInfosPaginationState(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching device infos:', error);
      setDeviceInfos([]);
    } finally {
      setLoadingDeviceInfos(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'device-info') {
      fetchDeviceInfos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, deviceInfoSearchTerm, selectedDeviceInfoBrand, deviceInfosPaginationState.pageNum, deviceInfosPaginationState.pageSize]);

  // Fetch colors với server-side pagination
  const fetchColors = async () => {
    setLoadingColors(true);
    try {
      const filter = {
        search: colorSearchTerm,
      };
      const pagination = {
        page: colorsPaginationState.pageNum,
        limit: colorsPaginationState.pageSize,
      };
      const response = await colorService.getColors(filter, pagination);
      const list = response.colors || [];
      setColors(list.map((item: Color) => ({ ...item, selected: false })));
      setColorsPaginationState(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'colors') {
      fetchColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, colorSearchTerm, colorsPaginationState.pageNum, colorsPaginationState.pageSize]);

  // Fetch device colors
  const fetchDeviceColors = async () => {
    setLoadingDeviceColors(true);
    try {
      const response = await deviceColorService.getDeviceColorLinks(
        { search: deviceColorSearchTerm },
        {
          pageNum: deviceColorsPaginationState.pageNum,
          pageSize: deviceColorsPaginationState.pageSize,
        }
      );
      setDeviceColors(response.data.map(item => ({ ...item, selected: false })));
      setDeviceColorsPaginationState(prev => ({
        ...prev,
        pageNum: response.pagination.pageNum,
        pageSize: response.pagination.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching device colors:', error);
      setDeviceColors([]);
    } finally {
      setLoadingDeviceColors(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'device-colors') {
      fetchDeviceColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, deviceColorSearchTerm, deviceColorsPaginationState.pageNum, deviceColorsPaginationState.pageSize]);

  // Device Colors handlers
  const handleDeleteDeviceColor = async (id: string) => {
    try {
      setLoadingAction(true);
      const deleted = await deviceColorService.deleteDeviceColorLink(id);
      if (!deleted) {
        alert('Không thể xóa liên kết thiết bị - màu sắc.');
        return;
      }
      alert('Xóa liên kết thiết bị - màu sắc thành công');
      await fetchDeviceColors();
    } catch (error: any) {
      console.error('Error deleting device color:', error);
      alert(error?.message || 'Không thể xóa liên kết thiết bị - màu sắc');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSearchDeviceColors = (term: string) => {
    setDeviceColorSearchTerm(term);
    setDeviceColorsPaginationState(prev => ({ ...prev, pageNum: 1 }));
  };

  const deviceColorsPagination = {
    pagination: {
      currentPage: deviceColorsPaginationState.pageNum,
      itemsPerPage: deviceColorsPaginationState.pageSize,
      totalItems: deviceColorsPaginationState.total,
      totalPages: deviceColorsPaginationState.totalPages,
    },
    handlePageChange: (page: number) => {
      setDeviceColorsPaginationState(prev => ({ ...prev, pageNum: page }));
    },
    handleItemsPerPageChange: (itemsPerPage: number) => {
      setDeviceColorsPaginationState(prev => ({ ...prev, pageSize: itemsPerPage, pageNum: 1 }));
    },
  };

  const handleOpenAddDeviceColorModal = () => {
    if (deviceInfoOptions.length === 0) {
      alert('Vui lòng tạo ít nhất một thiết bị trước khi liên kết màu sắc.');
      return;
    }
    if (colorOptions.length === 0) {
      alert('Vui lòng tạo ít nhất một màu sắc trước khi liên kết thiết bị.');
      return;
    }
    setDeviceColorFormError(null);
    setDeviceInfoIdForLink((prev) => prev || deviceInfoOptions[0]?.id || '');
    setColorIdForLink((prev) => prev || colorOptions[0]?.id || '');
    setShowAddDeviceColorModal(true);
  };

  const handleCloseAddDeviceColorModal = () => {
    setShowAddDeviceColorModal(false);
    setDeviceInfoIdForLink('');
    setColorIdForLink('');
    setDeviceColorFormError(null);
  };

  const handleCreateDeviceColorLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deviceInfoIdForLink || !colorIdForLink) {
      setDeviceColorFormError('Vui lòng chọn thiết bị và màu sắc.');
      return;
    }
    setCreatingDeviceColorLink(true);
    setDeviceColorFormError(null);
    try {
      await deviceColorService.addDeviceColor(deviceInfoIdForLink, colorIdForLink);
      alert('Thêm liên kết màu sắc - thiết bị thành công');
      handleCloseAddDeviceColorModal();
      await fetchDeviceColors();
    } catch (error: any) {
      console.error('Error creating device color link:', error);
      setDeviceColorFormError(error?.message || 'Không thể tạo liên kết màu sắc - thiết bị.');
    } finally {
      setCreatingDeviceColorLink(false);
    }
  };

  const handleEditDevice = (device: UserDevice) => {
    setEditingDevice(device);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingDevice(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditForm();
    refetch();
  };

  const clearAllSelections = () => {
    userDevicesSelection.clearSelection?.();
    deviceInfosSelection.clearSelection?.();
    colorsSelection.clearSelection?.();
    materialsSelection.clearSelection?.();
    brandsSelection.clearSelection?.();
  };

  const deviceForms = useDeviceForms(
    setUserDevices,
    setDeviceInfos,
    setColors,
    setStorages,
  );

  const handleDownloadTemplate = async () => {
    try {
      setLoadingAction(true);
      const blob = await userDeviceService.downloadTemplate();
      userDeviceService.downloadFile(blob, 'Mau_Nhap_Thiet_Bi.xlsx');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingAction(true);
      const result: ImportResponse = await userDeviceService.importFromExcel(file);
      e.target.value = '';
      const importData = result.data;
      let message = `Import hoàn tất!\n- Tổng cộng: ${importData.total}\n- Thành công: ${importData.success}\n- Thất bại: ${importData.error}`;
      if (importData.created_count > 0) message += `\n- Tạo mới: ${importData.created_count}`;
      if (importData.updated_count > 0) message += `\n- Cập nhật: ${importData.updated_count}`;
      if (importData.error > 0 && importData.errors) {
        message += '\n\nChi tiết lỗi:\n';
        importData.errors.slice(0, 5).forEach((errorMsg: string) => {
          message += `- ${errorMsg}\n`;
        });
        if (importData.errors.length > 5) message += '... và nhiều lỗi khác.\n';
      }
      alert(message);
      if (importData.success > 0) await fetchUserDevices();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Import thất bại! Vui lòng kiểm tra file và thử lại.';
      alert(errorMessage);
      e.target.value = '';
    } finally {
      setLoadingAction(false);
    }
  };

  const triggerImportMyDevices = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e) => handleImportExcel(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  const handleExportExcel = async () => {
    if (userDevices.length === 0) {
      alert('Không có dữ liệu nào để xuất!');
      return;
    }
    try {
      setLoadingAction(true);
      const blob = await userDeviceService.exportToExcel();
      const date = new Date().toISOString().split('T')[0];
      userDeviceService.downloadFile(blob, `Xuat_Thiet_Bi_${date}.xlsx`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSelectedMyDevices = async () => {
    const itemsToDelete = filteredUserDevices.filter(item => (item as any).selected);
    if (itemsToDelete.length === 0) {
      alert('Vui lòng chọn ít nhất một mục để xóa!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${itemsToDelete.length} mục đã chọn?`)) {
      try {
        setLoadingAction(true);
        const deviceIds = itemsToDelete.map(item => (item as UserDevice).id);
        await userDeviceService.bulkDeleteUserDevices(deviceIds);
        alert(`Đã xóa ${itemsToDelete.length} thiết bị thành công!`);
        await fetchUserDevices();
        fetchRestorableDevices();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleDeleteAllMyDevices = async () => {
    if (window.confirm('CẢNH BÁO! Bạn có chắc muốn xóa TẤT CẢ "Thiết bị của tôi"?')) {
      setLoadingAction(true);
      try {
        await userDeviceService.deleteAllUserDevices();
        alert('Đã xóa tất cả thiết bị.');
        await fetchUserDevices();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleRestoreDeletedData = async () => {
    if (restorableDevices.length === 0) {
      alert('Không có thiết bị nào đã xóa hôm nay để khôi phục.');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn khôi phục ${restorableDevices.length} thiết bị đã xóa hôm nay?`)) {
      try {
        setLoadingAction(true);
        const result = await userDeviceService.restoreAllDeletedToday();
        alert(result.message || 'Khôi phục thành công!');
        await fetchUserDevices();
        fetchRestorableDevices();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleOpenAddForm = () => {
    deviceForms.resetForms();
    setEditingColor(null);
    setEditingStorage(null);
    setSelectedDeviceInfoForStorage('');
    deviceForms.setStorageForm({ capacity: '' });
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setEditingColor(null);
    setEditingStorage(null);
    setEditingDeviceInfoId(null);
    setSelectedDeviceInfoForStorage('');
  };
  const handleEditDeviceInfo = (device: DeviceInfo) => {
    const formData: DeviceInfoFormData = {
      model: device.model || '',
      brand: device.brand || '',
      release_date: device.release_date || '',
      warranty: device.warranty || '',
      materials: device.materials || [],
      screen: device.screen || '',
      chip_ram: device.chip_ram || '',
      camera: device.camera || '',
      battery: device.battery || '',
      connectivity_os: device.connectivity_os || '',
      color_english: device.color_english || '',
      dimensions_weight: device.dimensions_weight || '',
      sensors_health_features: device.sensors_health_features || '',
    };
    setEditingDeviceInfo(formData);
    setEditingDeviceInfoId(device.id);
    setShowEditDeviceInfoForm(true);
  };

  const handleCloseEditDeviceInfoForm = () => {
    setShowEditDeviceInfoForm(false);
    setEditingDeviceInfo(null);
    setEditingDeviceInfoId(null);
  };

  const handleDeleteDeviceInfo = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa thông tin thiết bị này?')) {
      try {
        setLoadingAction(true);
        await deviceInfoService.deleteDeviceInfo(id);
        alert('Xóa thành công');
        await fetchDeviceInfos();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleImportDeviceInfos = () => {
    const input = document.getElementById('device-info-import-input') as HTMLInputElement | null;
    if (input) input.click();
  };

  const handleFileImportDeviceInfos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAction(true);
    try {
      const result = await deviceInfoService.importDeviceInfos(file);
      alert(`Import thành công: ${result.data.success} mục`);
      refetch();
    } catch (error: any) {
      alert(`Lỗi Import: ${error.message}`);
    } finally {
      setLoadingAction(false);
      e.target.value = '';
    }
  };

  const handleExportDeviceInfos = async () => {
    setLoadingAction(true);
    try {
      await deviceInfoService.exportDeviceInfos();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExportTemplate = async () => {
    setLoadingAction(true);
    try {
      await deviceInfoService.exportTemplate();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSelectedDeviceInfos = async () => {
    const selectedIds = filteredDeviceInfos.filter(d => (d as any).selected).map(d => d.id);
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn mục để xóa');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} mục đã chọn?`)) {
      setLoadingAction(true);
      try {
        await deviceInfoService.deleteMultipleDeviceInfos(selectedIds);
        alert('Xóa thành công');
        await fetchDeviceInfos();
        deviceInfosSelection.clearSelection?.();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleDeleteAllDeviceInfos = async () => {
    if (window.confirm('CẢNH BÁO! Bạn có chắc muốn xóa TẤT CẢ thông tin thiết bị?')) {
      setLoadingAction(true);
      try {
        await deviceInfoService.deleteAllDeviceInfos();
        alert('Đã xóa tất cả thông tin thiết bị');
        await fetchDeviceInfos();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setShowAddForm(true);
    setActiveSubTab('colors');
  };

  const handleDeleteColor = async (color: Color) => {
    if (window.confirm(`Bạn có chắc muốn xóa màu "${color.name}"?`)) {
      setLoadingAction(true);
      try {
        await colorService.deleteColor(color.id);
        alert('Xóa thành công');
        await fetchColors();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleDeleteSelectedColors = async () => {
    const itemsToDelete = filteredColors.filter(item => (item as any).selected);
    if (itemsToDelete.length === 0) {
      alert('Vui lòng chọn ít nhất một màu để xóa!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${itemsToDelete.length} màu đã chọn?`)) {
      setLoadingAction(true);
      try {
        let successCount = 0;
        let errorCount = 0;
        for (const item of itemsToDelete) {
          try {
            await colorService.deleteColor(item.id);
            successCount++;
          } catch (err) {
            console.error("Error deleting color:", err);
            errorCount++;
          }
        }
        alert(`Đã xóa ${successCount} màu thành công! ${errorCount > 0 ? `${errorCount} thất bại.` : ''}`);
        await fetchColors();
        colorsSelection.clearSelection?.();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const selectedStoragesCount = filteredStorages.reduce((acc: number, s: any) => acc + (s.selected ? 1 : 0), 0);
  const selectAllStorages = filteredStorages.length > 0 && filteredStorages.every((s: any) => !!s.selected);
  const handleSelectStorageItem = (id: string, checked: boolean) => {
    setStorages((prev: any[]) =>
      prev.map((s: any) => {
        const sid = String(s.id || s.storage_id || s.device_storage_id || '');
        return sid === id ? { ...s, selected: checked } : s;
      })
    );
  };

  const handleSelectAllStorages = (checked: boolean) => {
    const idsOnPage = new Set(
      paginatedStorages.map((s: any) => String(s.id || s.storage_id || s.device_storage_id || ''))
    );
    setStorages((prev: any[]) =>
      prev.map((s: any) => {
        const sid = String(s.id || s.storage_id || s.device_storage_id || '');
        return idsOnPage.has(sid) ? { ...s, selected: checked } : s;
      })
    );
  };

  const handleDeleteSelectedStorages = async () => {
    const selected = normalizedStorages.filter((s: any) => s.selected);
    if (selected.length === 0) {
      alert('Vui lòng chọn dung lượng để xóa');
      return;
    }
    if (!window.confirm(`Xóa ${selected.length} dung lượng đã chọn?`)) return;

    setLoadingAction(true);
    let successCount = 0;
    let errorCount = 0;
    let foreignKeyErrors = 0;

    try {
      for (const s of selected) {
        try {
          const storageId = String(s.id || s.storage_id || s.device_storage_id || '');
          const deviceInfoId = String(s.device_info_id || s.device_id || ''); // Lấy deviceInfoId
          
          if (!storageId || !deviceInfoId) { // Kiểm tra cả hai
            errorCount++;
            continue;
          }
          
          // SỬA LỖI: Truyền cả deviceInfoId và storageId
          await deviceStorageService.removeDeviceStorage(deviceInfoId, storageId);
          successCount++;
        } catch (err: any) {
          console.error('Error deleting storage:', err);
          if (err.message && (err.message.includes('ForeignKeyViolationError') || err.message.includes('sử dụng'))) {
            foreignKeyErrors++;
          }
          errorCount++;
        }
      }
      
      let alertMessage = `Đã xóa thành công ${successCount} dung lượng.`;
      if (errorCount > 0) {
        alertMessage += `\n${errorCount} thất bại.`;
      }
      if (foreignKeyErrors > 0) {
        alertMessage += `\n(${foreignKeyErrors} lỗi do đang được thiết bị của người dùng tham chiếu.)`;
      }
      alert(alertMessage);

      if (successCount > 0) {
        await refetch();
      }
    } finally {
      setLoadingAction(false);
    }
  };



  const handleEditStorage = (storage: any) => {
    const storageId = String(storage.id || storage.storage_id || storage.device_storage_id || '');
    const deviceInfoId = String(storage.device_info_id || storage.device_id || '');
    setEditingStorage({ ...storage, id: storageId });
    setSelectedDeviceInfoForStorage(deviceInfoId);
    deviceForms.setStorageForm?.({ capacity: String(storage.capacity ?? '') });
    setShowAddForm(true);
    setActiveSubTab('storage');
  };


  const handleDeleteStorage = async (storage: any) => {
    const storageId = String(storage.id || storage.storage_id || storage.device_storage_id || '');
    // SỬA LỖI: Lấy deviceInfoId từ chính 'storage' object
    const deviceInfoId = String(storage.device_info_id || storage.device_id || '');
    const capacity = storage.capacity || 0;

    if (!storageId) {
      alert('Lỗi: Không tìm thấy ID của dung lượng');
      return;
    }
    
    if (!deviceInfoId) {
        alert('Lỗi: Không tìm thấy ID thiết bị (deviceInfoId) của dung lượng này');
        return;
    }

    if (!window.confirm(`Xóa dung lượng ${capacity}GB?`)) return;

    setLoadingAction(true);
    try {
      // SỬA LỖI: Truyền cả deviceInfoId và storageId
      await deviceStorageService.removeDeviceStorage(deviceInfoId, storageId);
      alert('Xóa thành công');
      await refetch();
    } catch (error: any) {
      console.error('Delete storage error:', error);
      let errorMsg = error?.message || 'Không thể xóa';
      if (error.message && (error.message.includes('ForeignKeyViolationError') || error.message.includes('sử dụng'))) {
         errorMsg = `Không thể xóa dung lượng ${capacity}GB vì đang được một thiết bị của người dùng sử dụng.`;
      }
      alert(`Lỗi xóa: ${errorMsg}`);
    } finally {
      setLoadingAction(false);
    }
  };



  const renderForm = () => {
    switch (activeSubTab) {
      case 'my-devices':
        return (
          <MyDeviceForm
            formData={deviceForms.myDeviceForm}
            onSubmit={(e: React.FormEvent) => {
              deviceForms.handleSubmitMyDevice(e);
              handleCloseAddForm();
            }}
            onChange={deviceForms.handleMyDeviceFormChange}
            onCancel={handleCloseAddForm}
          />
        );
      case 'device-info':
        return (
          <DeviceForm
            formData={deviceForms.deviceForm}
            onSubmit={(e: React.FormEvent) => {
              deviceForms.handleSubmitDevice(e);
              handleCloseAddForm();
            }}
            onChange={deviceForms.handleDeviceFormChange}
            onCancel={handleCloseAddForm}
            availableMaterials={materials}
            onMaterialsChange={(selectedMaterials: Material[]) => {}}
            selectedMaterials={deviceForms.deviceForm.materials || []}
          />
        );
      case 'colors':
        return (
          <ColorForm
            formData={
              editingColor
                ? { name: editingColor.name, hex_code: editingColor.hex_code ?? '#000000' }
                : { name: deviceForms.colorForm.name, hex_code: (deviceForms.colorForm as any).hex_code ?? '#000000' }
            }
            onSubmit={(e: React.FormEvent) => {
              deviceForms.handleSubmitColor(e);
              handleCloseAddForm();
            }}
            onChange={deviceForms.handleColorFormChange}
            onCancel={handleCloseAddForm}
            isEditMode={!!editingColor}
          />
        );
        case 'storage':
          return (
            <StorageForm
              formData={deviceForms.storageForm}
              deviceInfos={deviceInfos}
              selectedDeviceInfoId={selectedDeviceInfoForStorage}
              disableSubmit={deviceInfos.length === 0 || !selectedDeviceInfoForStorage}
              onSubmit={async (e: React.FormEvent) => {
                e.preventDefault();
                setLoadingAction(true);
                try {
                  const capacity = Number(deviceForms.storageForm.capacity || 0);
                  if (!capacity || capacity <= 0) {
                    alert('Vui lòng nhập dung lượng hợp lệ (lớn hơn 0)');
                    return;
                  }

                  let deviceInfoId = selectedDeviceInfoForStorage;
                  if (!deviceInfoId && editingStorage) {
                    deviceInfoId = String((editingStorage as any).device_info_id || '');
                  }
                  if (!deviceInfoId) {
                    alert('Vui lòng chọn thiết bị để thêm dung lượng');
                    return;
                  }

                  if (editingStorage) {
                    const storageId = String(
                      (editingStorage as any).id ||
                      (editingStorage as any).storage_id ||
                      (editingStorage as any).device_storage_id ||
                      ''
                    );
                    if (!storageId) {
                      alert('Lỗi: Không tìm thấy ID của dung lượng cần sửa');
                      return;
                    }
                    // SỬA LỖI: Truyền cả deviceInfoId và storageId
                    await deviceStorageService.removeDeviceStorage(deviceInfoId, storageId);
                    await deviceStorageService.createDeviceStorage({ device_info_id: deviceInfoId, capacity });
                    alert('Cập nhật dung lượng thành công');
                  } else {
                    await deviceStorageService.createDeviceStorage({ device_info_id: deviceInfoId, capacity });
                    alert('Thêm dung lượng thành công');
                  }

                  handleCloseAddForm();
                  await refetch();
                } catch (error: any) {
                  console.error('Submit storage error:', error);
                  let errorMsg = error?.message || 'Không thể lưu';
                  
                  if (error.message && (error.message.includes('ForeignKeyViolationError') || error.message.includes('sử dụng'))) {
                    errorMsg = 'Không thể cập nhật. Dung lượng cũ đang được một thiết bị sử dụng.';
                  }
                  
                  alert(`Lỗi: ${errorMsg}`);
                } finally {
                  setLoadingAction(false);
                }
              }}
              onChange={(field, value) => {
                if (field === 'device_info_id') setSelectedDeviceInfoForStorage(value);
                else deviceForms.handleStorageFormChange(field, value);
              }}
              onCancel={handleCloseAddForm}
              isEditMode={!!editingStorage}
            />

          );
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        type="file"
        id="device-info-import-input"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileImportDeviceInfos}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Thiết bị</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin thiết bị, màu sắc và dung lượng</p>
          </div>
        </div>

        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <MyDeviceForm
                editMode={true}
                deviceId={editingDevice?.id}
                onSuccess={handleEditSuccess}
                onCancel={handleCloseEditForm}
              />
            </div>
          </div>
        )}

        {showEditDeviceInfoForm && editingDeviceInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <DeviceForm
                formData={editingDeviceInfo}
                isEditing={true}
                deviceId={editingDeviceInfoId}
                onChange={(e) => {
                  setEditingDeviceInfo(prev => prev ? { ...prev, [e.target.name]: (e.target as HTMLInputElement).value } : null);
                }}
                onCancel={handleCloseEditDeviceInfoForm}
                onSubmit={async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!editingDeviceInfoId) return;
                  setLoadingAction(true);
                  try {
                    await deviceInfoService.updateDeviceInfo(editingDeviceInfoId, editingDeviceInfo);
                    alert('Cập nhật thành công');
                    handleCloseEditDeviceInfoForm();
                    refetch();
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                availableMaterials={materials}
                onMaterialsChange={(mats) => setEditingDeviceInfo(prev => prev ? { ...prev, materials: mats } : null)}
                selectedMaterials={editingDeviceInfo.materials || []}
              />
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {renderForm()}
            </div>
          </div>
        )}

        {showAddDeviceColorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Thêm liên kết màu sắc - thiết bị</h2>
                <button
                  type="button"
                  onClick={handleCloseAddDeviceColorModal}
                  className="text-gray-500 hover:text-gray-700 transition"
                  disabled={creatingDeviceColorLink}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDeviceColorLink} className="px-5 py-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="deviceInfo" className="block text-sm font-medium text-gray-700">
                    Thiết bị
                  </label>
                  <select
                    id="deviceInfo"
                    value={deviceInfoIdForLink}
                    onChange={(event) => setDeviceInfoIdForLink(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    disabled={creatingDeviceColorLink}
                    required
                  >
                    {deviceInfoOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Màu sắc
                  </label>
                  <select
                    id="color"
                    value={colorIdForLink}
                    onChange={(event) => setColorIdForLink(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    disabled={creatingDeviceColorLink}
                    required
                  >
                    {colorOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {deviceColorFormError && (
                  <div className="text-sm text-red-600">{deviceColorFormError}</div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseAddDeviceColorModal}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    disabled={creatingDeviceColorLink}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:cursor-not-allowed disabled:bg-blue-300"
                    disabled={creatingDeviceColorLink}
                  >
                    {creatingDeviceColorLink ? 'Đang lưu...' : 'Tạo liên kết'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DeviceTabs
          activeSubTab={activeSubTab}
          onTabChange={(tab: SubTabType) => {
            setActiveSubTab(tab);
            clearAllSelections();
          }}
          userDevices={paginatedUserDevices}
          deviceInfos={paginatedDeviceInfos}
          colors={paginatedColors}
          storages={paginatedStorages}
          onEdit={handleEditDevice}
          materialsPagination={materialsPagination}
          brandsPagination={brandsPagination}
          userDevicesPagination={userDevicesPagination}
          deviceInfosPagination={deviceInfosPagination}
          colorsPagination={colorsPagination}
          storagesPagination={storagesPagination}
          onSelectAllUserDevices={userDevicesSelection.handleSelectAll}
          onSelectUserDeviceItem={userDevicesSelection.handleSelectItem}
          selectAllUserDevices={userDevicesSelection.selectAll}
          selectedUserDevicesCount={userDevicesSelection.getSelectedCount()}
          onSelectAllDeviceInfos={deviceInfosSelection.handleSelectAll}
          onSelectDeviceInfoItem={deviceInfosSelection.handleSelectItem}
          selectAllDeviceInfos={deviceInfosSelection.selectAll}
          selectedDeviceInfosCount={deviceInfosSelection.getSelectedCount()}
          onSelectAllColors={colorsSelection.handleSelectAll}
          onSelectColorItem={colorsSelection.handleSelectItem}
          selectAllColors={colorsSelection.selectAll}
          selectedColorsCount={colorsSelection.getSelectedCount()}
          onSelectAllStorages={handleSelectAllStorages}
          onSelectStorageItem={handleSelectStorageItem}
          selectAllStorages={selectAllStorages}
          selectedStoragesCount={selectedStoragesCount}
          onSelectAllMaterials={materialsSelection.handleSelectAll}
          onSelectMaterialItem={materialsSelection.handleSelectItem}
          selectAllMaterials={materialsSelection.selectAll}
          selectedMaterialsCount={materialsSelection.getSelectedCount()}
          onSelectAllBrands={brandsSelection.handleSelectAll}
          onSelectBrandItem={brandsSelection.handleSelectItem}
          selectAllBrands={brandsSelection.selectAll}
          selectedBrandsCount={brandsSelection.getSelectedCount()}
          reloadUserDevices={fetchUserDevices}
          onEditDeviceInfo={handleEditDeviceInfo}
          onDeleteDeviceInfo={handleDeleteDeviceInfo}
          onImportDeviceInfos={handleImportDeviceInfos}
          onExportDeviceInfos={handleExportDeviceInfos}
          onExportTemplate={handleExportTemplate}
          onDeleteSelectedDeviceInfos={handleDeleteSelectedDeviceInfos}
          onDeleteAllDeviceInfos={handleDeleteAllDeviceInfos}
          reloadDeviceInfos={fetchDeviceInfos}
          deviceInfoBrands={deviceInfoBrands}
          selectedDeviceInfoBrand={selectedDeviceInfoBrand}
          onDeviceInfoBrandChange={(brand: string) => {
            setSelectedDeviceInfoBrand(brand);
            setDeviceInfosPaginationState(prev => ({ ...prev, pageNum: 1 }));
          }}
          onSearchDeviceInfos={(term: string) => {
            setDeviceInfoSearchTerm(term);
            setDeviceInfosPaginationState(prev => ({ ...prev, pageNum: 1 }));
          }}
          deviceInfoSearchTerm={deviceInfoSearchTerm}
          onAddNewDeviceInfo={handleOpenAddForm}
          onAddNewColor={handleOpenAddForm}
          onDeleteSelectedColors={handleDeleteSelectedColors}
          onSearchColors={(term: string) => {
            setColorSearchTerm(term);
            setColorsPaginationState(prev => ({ ...prev, pageNum: 1 }));
          }}
          colorSearchTerm={colorSearchTerm}
          onEditColor={handleEditColor}
          onDeleteColor={handleDeleteColor}
          onAddNewStorage={handleOpenAddForm}
          onDeleteSelectedStorages={handleDeleteSelectedStorages}
          onSearchStorages={setStorageSearchTerm}
          storageSearchTerm={storageSearchTerm}
          onEditStorage={handleEditStorage}
          onDeleteStorage={handleDeleteStorage}
          onAddNewMyDevice={handleOpenAddForm}
          onDeleteSelectedMyDevices={handleDeleteSelectedMyDevices}
          onSearchMyDevices={(term: string) => {
            setMyDeviceSearchTerm(term);
            setUserDevicesPaginationState(prev => ({ ...prev, pageNum: 1 }));
          }}
          myDeviceSearchTerm={myDeviceSearchTerm}
          onImportMyDevices={triggerImportMyDevices}
          onExportMyDevices={handleExportExcel}
          onDownloadMyDevicesTemplate={handleDownloadTemplate}
          onDeleteAllMyDevices={handleDeleteAllMyDevices}
          onRestoreMyDevices={handleRestoreDeletedData}
          deviceColors={deviceColors}
          deviceColorsPagination={deviceColorsPagination}
          onSelectAllDeviceColors={deviceColorsSelection.handleSelectAll}
          onSelectDeviceColorItem={deviceColorsSelection.handleSelectItem}
          selectAllDeviceColors={deviceColorsSelection.selectAll}
          selectedDeviceColorsCount={deviceColorsSelection.getSelectedCount()}
          onDeleteDeviceColor={handleDeleteDeviceColor}
          onSearchDeviceColors={handleSearchDeviceColors}
          deviceColorSearchTerm={deviceColorSearchTerm}
          onAddDeviceColorLink={handleOpenAddDeviceColorModal}
        />
      </div>
    </div>
  );
};

export default DeviceManagement;