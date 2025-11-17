// import React, { useState, useEffect, useRef } from 'react';
// import { Smartphone, Plus, Trash2, Edit, Save, X, Search, Database, FileDown, FileUp, Download, Upload, Filter, MoreVertical } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth';
// import { Navigate } from 'react-router-dom';
// import LoadingSpinner from '../components/LoadingSpinner';

// interface DeviceInfo {
//   id: string;
//   model: string;
//   release_date?: string;
//   screen?: string;
//   chip_ram?: string;
//   camera?: string;
//   battery?: string;
//   connectivity_os?: string;
// }

// interface Color {
//   id: string;
//   name: string;
// }

// interface Storage {
//   id: string;
//   device_info_id: string;
//   capacity: number;
// }

// interface UserDevice {
//   id?: string;
//   user_id?: string;
//   device_info_id: string;
//   color_id: string;
//   storage_id: string;
//   device_storage_id?: string;
//   warranty?: string;
//   device_condition: string;
//   device_type: string;
//   battery_condition?: string;
//   price: number;
//   inventory: number;
//   notes?: string;
//   created_at?: string;
//   updated_at?: string;
//   deviceModel?: string;
//   colorName?: string;
//   storageCapacity?: number;
//   device_info?: DeviceInfo;
//   color?: Color;
//   device_storage?: Storage;
//   product_code?: string;
// }

// export const ChatbotPage: React.FC = () => {
//   const { isAuthenticated, isLoading, user } = useAuth();
//   const [devices, setDevices] = useState<DeviceInfo[]>([]);
//   const [colors, setColors] = useState<Color[]>([]);
//   const [storages, setStorages] = useState<Storage[]>([]);
//   const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  
//   const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
//   const [selectedColor, setSelectedColor] = useState<Color | null>(null);
//   const [selectedStorage, setSelectedStorage] = useState<Storage | null>(null);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddingDevice, setIsAddingDevice] = useState(false);
//   const [isEditingDevice, setIsEditingDevice] = useState<string | null>(null);
//   const [isImportingExcel, setIsImportingExcel] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
  
//   const [newDevice, setNewDevice] = useState<UserDevice>({
//     device_info_id: '',
//     color_id: '',
//     storage_id: '',
//     device_condition: 'Mới',
//     device_type: 'Mới',
//     price: 0,
//     inventory: 0
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchDevices();
//       fetchUserDevices();
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (selectedDevice) {
//       fetchColors(selectedDevice.id);
//       fetchStorages(selectedDevice.id);
//     } else {
//       setColors([]);
//       setStorages([]);
//     }
//   }, [selectedDevice]);

//   const fetchDevices = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/device-infos?limit=100`, {
//         headers: token ? { 'Authorization': `Bearer ${token}` } : {},
//       });
//       const data = await response.json();
//       if (data.data) {
//         setDevices(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching devices:', error);
//     }
//   };

//   const fetchColors = async (deviceId: string) => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/device-infos/${deviceId}/colors`, {
//         headers: token ? { 'Authorization': `Bearer ${token}` } : {},
//       });
//       const data = await response.json();
//       if (data.data) {
//         setColors(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching colors:', error);
//     }
//   };

//   const fetchStorages = async (deviceId: string) => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/device-infos/${deviceId}/storages`, {
//         headers: token ? { 'Authorization': `Bearer ${token}` } : {},
//       });
//       const data = await response.json();
//       if (data.data) {
//         setStorages(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching storages:', error);
//     }
//   };

//   const fetchUserDevices = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!token) return;
      
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/my-devices`, {
//         headers: { 'Authorization': `Bearer ${token}` },
//       });
//       const data = await response.json();
//       if (data.data) {
//         const enrichedDevices = data.data.map((device: any) => {
//           return {
//             ...device,
//             deviceModel: device.device_info ? device.device_info.model : 'Unknown',
//             colorName: device.color ? device.color.name : 'Unknown',
//             storageCapacity: device.device_storage ? device.device_storage.capacity : 0
//           };
//         });
        
//         setUserDevices(enrichedDevices);
//       }
//     } catch (error) {
//       console.error('Error fetching user devices:', error);
//     }
//   };

//   const handleAddDevice = async () => {
//     if (!selectedDevice || !selectedColor || !selectedStorage) {
//       alert('Vui lòng chọn đầy đủ thông tin thiết bị, màu sắc và dung lượng');
//       return;
//     }
    
//     if (!user) {
//       alert('Vui lòng đăng nhập để thêm thiết bị');
//       return;
//     }

//     const deviceToAdd = {
//       ...newDevice,
//       device_info_id: selectedDevice.id,
//       color_id: selectedColor.id,
//       storage_id: selectedStorage.id
//     };

//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!token) {
//         alert('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
//         return;
//       }
      
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(deviceToAdd),
//       });

//       const data = await response.json();
//       if (data.data) {
//         setNewDevice({
//           device_info_id: '',
//           color_id: '',
//           storage_id: '',
//           device_condition: 'Mới',
//           device_type: 'Mới',
//           price: 0,
//           inventory: 0
//         });
//         setSelectedDevice(null);
//         setSelectedColor(null);
//         setSelectedStorage(null);
//         setIsAddingDevice(false);
//         fetchUserDevices();
//       }
//     } catch (error) {
//       console.error('Error adding device:', error);
//     }
//   };

//   const handleUpdateDevice = async (deviceId: string) => {
//     const deviceToUpdate = userDevices.find(d => d.id === deviceId);
//     if (!deviceToUpdate) return;

//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/${deviceId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(deviceToUpdate),
//       });

//       const data = await response.json();
//       if (data.data) {
//         setIsEditingDevice(null);
//         fetchUserDevices();
//       }
//     } catch (error) {
//       console.error('Error updating device:', error);
//     }
//   };

//   const handleDeleteDevice = async (deviceId: string) => {
//     if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/${deviceId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();
//       if (data.data) {
//         setUserDevices(userDevices.filter(d => d.id !== deviceId));
//       }
//     } catch (error) {
//       console.error('Error deleting device:', error);
//     }
//   };

//   const handleDownloadTemplate = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!token) {
//         alert('Vui lòng đăng nhập để tải template');
//         return;
//       }

//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/template`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Lỗi khi tải template Excel');
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'user_device_template.xlsx';
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       console.error('Lỗi khi tải template Excel:', error);
//       alert('Có lỗi xảy ra khi tải template Excel');
//     }
//   };

//   const handleExportExcel = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!token) {
//         alert('Vui lòng đăng nhập để xuất dữ liệu');
//         return;
//       }

//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/export/my-devices`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Lỗi khi xuất dữ liệu Excel');
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `user_devices_${new Date().toISOString().split('T')[0]}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       console.error('Lỗi khi xuất Excel:', error);
//       alert('Có lỗi xảy ra khi xuất dữ liệu Excel');
//     }
//   };

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setIsImportingExcel(true);
//     try {
//       const token = localStorage.getItem('auth_token');
//       if (!token) {
//         alert('Vui lòng đăng nhập để nhập dữ liệu');
//         return;
//       }

//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000'}/api/v1/user-devices/import`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });

//       const result = await response.json();
//       if (response.ok) {
//         alert(`Nhập dữ liệu thành công!\nTổng số: ${result.data.total}\nThành công: ${result.data.success}\nCập nhật: ${result.data.updated_count}\nTạo mới: ${result.data.created_count}\nLỗi: ${result.data.error}`);
//         fetchUserDevices();
//       } else {
//         alert(`Lỗi khi nhập dữ liệu: ${result.message || 'Không xác định'}`);
//       }
//     } catch (error) {
//       console.error('Lỗi khi import Excel:', error);
//       alert('Có lỗi xảy ra khi nhập dữ liệu Excel');
//     } finally {
//       setIsImportingExcel(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const filteredDevices = devices.filter(device => 
//     device.model.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-gray-600">Đang tải...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6">
//             <Smartphone className="text-white" size={32} />
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Quản lý <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kho Thiết bị</span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//             Quản lý toàn bộ thiết bị điện thoại trong cửa hàng của bạn một cách chuyên nghiệp và hiệu quả
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{userDevices.length}</p>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-xl">
//                 <Database className="text-blue-600" size={24} />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Tổng tồn kho</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {userDevices.reduce((sum, device) => sum + device.inventory, 0)}
//                 </p>
//               </div>
//               <div className="p-3 bg-green-50 rounded-xl">
//                 <Smartphone className="text-green-600" size={24} />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Thiết bị mới</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {userDevices.filter(d => d.device_condition === 'Mới').length}
//                 </p>
//               </div>
//               <div className="p-3 bg-amber-50 rounded-xl">
//                 <Plus className="text-amber-600" size={24} />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Đã qua sử dụng</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {userDevices.filter(d => d.device_condition === 'Đã qua sử dụng').length}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-50 rounded-xl">
//                 <Filter className="text-purple-600" size={24} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Card */}
//         <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//           {/* Header with Actions */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-600 rounded-lg">
//                   <Smartphone className="text-white" size={20} />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">Danh sách thiết bị</h2>
//                   <p className="text-sm text-gray-600">Quản lý tất cả thiết bị trong kho</p>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 {/* Template Download */}
//                 <button
//                   onClick={handleDownloadTemplate}
//                   className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
//                 >
//                   <Download size={16} />
//                   <span className="hidden sm:inline">Template</span>
//                 </button>

//                 {/* Export Button */}
//                 <button
//                   onClick={handleExportExcel}
//                   className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm"
//                 >
//                   <FileDown size={16} />
//                   <span className="hidden sm:inline">Xuất Excel</span>
//                 </button>

//                 {/* Import Button */}
//                 <button
//                   onClick={triggerFileInput}
//                   disabled={isImportingExcel}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm ${
//                     isImportingExcel 
//                       ? 'bg-amber-400 cursor-not-allowed' 
//                       : 'bg-amber-600 hover:bg-amber-700 text-white'
//                   }`}
//                 >
//                   {isImportingExcel ? (
//                     <LoadingSpinner size="sm" text="" />
//                   ) : (
//                     <FileUp size={16} />
//                   )}
//                   <span className="hidden sm:inline">Nhập Excel</span>
//                 </button>

//                 <input 
//                   type="file" 
//                   ref={fileInputRef} 
//                   onChange={handleFileChange} 
//                   accept=".xlsx, .xls" 
//                   className="hidden" 
//                 />

//                 {/* Add Device Button */}
//                 <button
//                   onClick={() => setIsAddingDevice(!isAddingDevice)}
//                   className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm"
//                 >
//                   {isAddingDevice ? <X size={16} /> : <Plus size={16} />}
//                   {isAddingDevice ? 'Hủy' : 'Thêm thiết bị'}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Add Device Form */}
//           {isAddingDevice && (
//             <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-200">
//               <div className="max-w-4xl">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <Plus className="text-blue-600" size={18} />
//                   Thêm thiết bị mới
//                 </h3>
                
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//                   {/* Device Selection */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Thiết bị *</label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         placeholder="Tìm kiếm thiết bị..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                       />
//                       <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
//                     </div>
                    
//                     <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-sm">
//                       {filteredDevices.length > 0 ? (
//                         filteredDevices.map(device => (
//                           <div
//                             key={device.id}
//                             onClick={() => {
//                               setSelectedDevice(device);
//                               setSearchTerm('');
//                             }}
//                             className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
//                               selectedDevice?.id === device.id 
//                                 ? 'bg-blue-100 border-l-4 border-blue-500' 
//                                 : 'border-l-4 border-transparent'
//                             }`}
//                           >
//                             <div className="font-medium text-gray-900">{device.model}</div>
//                             {device.release_date && (
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {new Date(device.release_date).getFullYear()}
//                               </div>
//                             )}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-4 py-3 text-gray-500 text-center">Không tìm thấy thiết bị</div>
//                       )}
//                     </div>
//                   </div>
                  
//                   {/* Color Selection */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Màu sắc *</label>
//                     <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-sm">
//                       {colors.length > 0 ? (
//                         colors.map(color => (
//                           <div
//                             key={color.id}
//                             onClick={() => setSelectedColor(color)}
//                             className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
//                               selectedColor?.id === color.id 
//                                 ? 'bg-blue-100 border-l-4 border-blue-500' 
//                                 : 'border-l-4 border-transparent'
//                             }`}
//                           >
//                             <div className="font-medium text-gray-900">{color.name}</div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-4 py-3 text-gray-500 text-center">
//                           {selectedDevice ? 'Không có màu sắc' : 'Vui lòng chọn thiết bị trước'}
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   {/* Storage Selection */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Dung lượng *</label>
//                     <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-sm">
//                       {storages.length > 0 ? (
//                         storages.map(storage => (
//                           <div
//                             key={storage.id}
//                             onClick={() => setSelectedStorage(storage)}
//                             className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${
//                               selectedStorage?.id === storage.id 
//                                 ? 'bg-blue-100 border-l-4 border-blue-500' 
//                                 : 'border-l-4 border-transparent'
//                             }`}
//                           >
//                             <div className="font-medium text-gray-900">{storage.capacity} GB</div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-4 py-3 text-gray-500 text-center">
//                           {selectedDevice ? 'Không có dung lượng' : 'Vui lòng chọn thiết bị trước'}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Device Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Tình trạng</label>
//                     <select
//                       value={newDevice.device_condition}
//                       onChange={(e) => setNewDevice({...newDevice, device_condition: e.target.value})}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     >
//                       <option value="Mới">Mới</option>
//                       <option value="Đã qua sử dụng">Đã qua sử dụng</option>
//                       <option value="Tân trang">Tân trang</option>
//                     </select>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Loại máy</label>
//                     <select
//                       value={newDevice.device_type}
//                       onChange={(e) => setNewDevice({...newDevice, device_type: e.target.value})}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     >
//                       <option value="Mới">Mới</option>
//                       <option value="Cũ">Cũ</option>
//                       <option value="Trưng bày">Trưng bày</option>
//                     </select>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
//                     <input
//                       type="number"
//                       value={newDevice.price}
//                       onChange={(e) => setNewDevice({...newDevice, price: parseFloat(e.target.value)})}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Tồn kho</label>
//                     <input
//                       type="number"
//                       value={newDevice.inventory}
//                       onChange={(e) => setNewDevice({...newDevice, inventory: parseInt(e.target.value)})}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     />
//                   </div>
//                 </div>
                
//                 {/* Additional Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Tình trạng pin</label>
//                     <input
//                       type="text"
//                       value={newDevice.battery_condition || ''}
//                       onChange={(e) => setNewDevice({...newDevice, battery_condition: e.target.value})}
//                       placeholder="VD: 100%, 90-99%, ..."
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Bảo hành</label>
//                     <input
//                       type="text"
//                       value={newDevice.warranty || ''}
//                       onChange={(e) => setNewDevice({...newDevice, warranty: e.target.value})}
//                       placeholder="VD: 12 tháng"
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     />
//                   </div>
//                 </div>
                
//                 {/* Notes */}
//                 <div className="space-y-2 mb-6">
//                   <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
//                   <textarea
//                     value={newDevice.notes || ''}
//                     onChange={(e) => setNewDevice({...newDevice, notes: e.target.value})}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     rows={3}
//                     placeholder="Thêm ghi chú về thiết bị..."
//                   ></textarea>
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => {
//                       setIsAddingDevice(false);
//                       setNewDevice({
//                         device_info_id: '',
//                         color_id: '',
//                         storage_id: '',
//                         device_condition: 'Mới',
//                         device_type: 'Mới',
//                         price: 0,
//                         inventory: 0
//                       });
//                       setSelectedDevice(null);
//                       setSelectedColor(null);
//                       setSelectedStorage(null);
//                     }}
//                     className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
//                   >
//                     Hủy bỏ
//                   </button>
//                   <button
//                     onClick={handleAddDevice}
//                     disabled={!selectedDevice || !selectedColor || !selectedStorage}
//                     className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
//                   >
//                     <Save size={16} />
//                     Lưu thiết bị
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Devices Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thiết bị</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Màu sắc</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dung lượng</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tình trạng</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tồn kho</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {userDevices.length > 0 ? (
//                   userDevices.map(device => (
//                     <tr key={device.id} className="hover:bg-gray-50 transition-colors duration-150">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="font-semibold text-gray-900">{device.deviceModel}</div>
//                           {device.product_code && (
//                             <div className="text-sm text-gray-500">Mã: {device.product_code}</div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                           {device.colorName}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
//                           {device.storageCapacity} GB
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex flex-col gap-1">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             device.device_condition === 'Mới' 
//                               ? 'bg-green-100 text-green-800'
//                               : device.device_condition === 'Đã qua sử dụng'
//                               ? 'bg-amber-100 text-amber-800'
//                               : 'bg-blue-100 text-blue-800'
//                           }`}>
//                             {device.device_condition}
//                           </span>
//                           <span className="text-xs text-gray-500">{device.device_type}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="font-semibold text-gray-900">
//                           {new Intl.NumberFormat('vi-VN').format(device.price)} ₫
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                           device.inventory > 10 
//                             ? 'bg-green-100 text-green-800'
//                             : device.inventory > 0
//                             ? 'bg-amber-100 text-amber-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {device.inventory}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                         <div className="flex justify-end space-x-2">
//                           {isEditingDevice === device.id ? (
//                             <>
//                               <button
//                                 onClick={() => handleUpdateDevice(device.id!)}
//                                 className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
//                                 title="Lưu"
//                               >
//                                 <Save size={16} />
//                               </button>
//                               <button
//                                 onClick={() => setIsEditingDevice(null)}
//                                 className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
//                                 title="Hủy"
//                               >
//                                 <X size={16} />
//                               </button>
//                             </>
//                           ) : (
//                             <>
//                               <button
//                                 onClick={() => setIsEditingDevice(device.id!)}
//                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
//                                 title="Sửa"
//                               >
//                                 <Edit size={16} />
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteDevice(device.id!)}
//                                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//                                 title="Xóa"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={7} className="px-6 py-12 text-center">
//                       <div className="flex flex-col items-center justify-center text-gray-500">
//                         <Database className="text-gray-400 mb-3" size={48} />
//                         <p className="text-lg font-medium mb-2">Chưa có thiết bị nào</p>
//                         <p className="text-sm mb-4">Hãy thêm thiết bị đầu tiên để bắt đầu quản lý</p>
//                         <button
//                           onClick={() => setIsAddingDevice(true)}
//                           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                           <Plus size={16} />
//                           Thêm thiết bị đầu tiên
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ChatbotPage;