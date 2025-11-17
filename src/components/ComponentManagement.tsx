// // src/components/ComponentManagement.tsx
// import React, { useState } from 'react';
// import { 
//   Plus, 
//   Download, 
//   RefreshCw, 
//   Edit, 
//   Trash2, 
//   ChevronLeft, 
//   ChevronRight, 
//   Search, 
//   Filter,
//   Upload,
//   RotateCcw,
//   Trash,
//   X,
//   Eye,
//   Image as ImageIcon,
//   ExternalLink
// } from 'lucide-react';

// interface Component {
//   id: string;
//   code: string;
//   name: string;
//   category: string;
//   attribute: string;
//   retailPrice: number;
//   wholesalePrice: number;
//   brand: string;
//   warranty: string;
//   stock: number;
//   description: string;
//   deletedAt?: string;
//   images?: string[];
//   productLink?: string;
// }

// interface ColumnConfig {
//   id: string;
//   label: string;
//   visible: boolean;
// }

// const ComponentManagement: React.FC = () => {
//   const [showColumnSelector, setShowColumnSelector] = useState(false);
//   const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string>('');
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedBrand, setSelectedBrand] = useState('');
//   const [stockStatus, setStockStatus] = useState('');
//   const [showDeleted, setShowDeleted] = useState(false);
//   const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
//   const [selectAll, setSelectAll] = useState(false);

//   // Column configuration state
//   const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
//     { id: 'code', label: 'Mã SP', visible: true },
//     { id: 'name', label: 'Tên Sản Phẩm', visible: true },
//     { id: 'image', label: 'Ảnh Sản Phẩm', visible: true },
//     { id: 'category', label: 'Danh Mục', visible: true },
//     { id: 'attribute', label: 'Thuộc Tính', visible: true },
//     { id: 'retailPrice', label: 'Giá bán lẻ', visible: true },
//     { id: 'wholesalePrice', label: 'Giá Bán Buôn', visible: true },
//     { id: 'brand', label: 'Thương Hiệu', visible: true },
//     { id: 'warranty', label: 'Bảo Hành', visible: true },
//     { id: 'stock', label: 'Tồn Kho', visible: true },
//     { id: 'description', label: 'Mô Tả Sản Phẩm', visible: true },
//     { id: 'link', label: 'Link Sản Phẩm', visible: true },
//   ]);

//   const components: Component[] = [
//     { 
//       id: '1', 
//       code: 'SP009811', 
//       name: 'Cáp nối dài gắn chân pin iPhone', 
//       category: 'Box, Đế test, Cáp', 
//       attribute: 'MODEL: 13, 13mini', 
//       retailPrice: 31000, 
//       wholesalePrice: 28000, 
//       brand: 'KHÁC', 
//       warranty: 'N/A', 
//       stock: 14, 
//       description: 'Cáp nối dài chất lượng cao, tương thích với iPhone 13 series',
//       images: [
//         'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
//         'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop'
//       ],
//       productLink: 'https://example.com/products/sp009811'
//     },
//     { 
//       id: '2', 
//       code: 'SP007320', 
//       name: 'Cáp nối main sạc Oppo A52', 
//       category: 'Cáp nối main', 
//       attribute: 'N/A', 
//       retailPrice: 10000, 
//       wholesalePrice: 10000, 
//       brand: 'KHÁC', 
//       warranty: 'N/A', 
//       stock: 4, 
//       description: 'Cáp nối main chính hãng cho Oppo A52',
//       images: [
//         'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop'
//       ],
//       productLink: 'https://example.com/products/sp007320'
//     },
//     { 
//       id: '3', 
//       code: 'SP004164', 
//       name: 'Cáp nối main sạc Samsung M20', 
//       category: 'Cáp nối main', 
//       attribute: 'N/A', 
//       retailPrice: 10000, 
//       wholesalePrice: 10000, 
//       brand: 'KHÁC', 
//       warranty: 'N/A', 
//       stock: 0, 
//       description: 'Cáp nối main cho Samsung Galaxy M20',
//       images: [
//         'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=300&h=300&fit=crop',
//         'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop'
//       ],
//       productLink: 'https://example.com/products/sp004164'
//     },
//     { 
//       id: '4', 
//       code: 'SP009812', 
//       name: 'Cáp sạc iPhone đã xóa', 
//       category: 'Cáp sạc', 
//       attribute: 'MODEL: 14 Pro', 
//       retailPrice: 45000, 
//       wholesalePrice: 40000, 
//       brand: 'KHÁC', 
//       warranty: 'N/A', 
//       stock: 0, 
//       description: 'Cáp sạc iPhone 14 Pro chính hãng', 
//       deletedAt: '2024-01-15',
//       images: [
//         'https://images.unsplash.com/photo-1609592810794-1c0d49c81bb5?w=300&h=300&fit=crop'
//       ],
//       productLink: 'https://example.com/products/sp009812'
//     },
//   ];

//   const categories = ['Tất cả danh mục', 'Box, Đế test, Cáp', 'Cáp nối main', 'Cáp âm lượng', 'Công tắc nguồn'];
//   const brands = ['Tất cả thương hiệu', 'KHÁC', 'LUBAN', 'Không xác định'];
//   const stockStatuses = ['Tình trạng tồn kho', 'Còn hàng', 'Sắp hết hàng', 'Hết hàng'];

//   const getStockClass = (stock: number) => {
//     if (stock === 0) return 'text-red-700 font-bold';
//     if (stock <= 5) return 'text-red-600 font-semibold';
//     return '';
//   };

//   const handleImportTemplate = () => {
//     console.log('Tải template Excel');
//   };

//   const handleDeleteAll = () => {
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = () => {
//     console.log('Xóa các linh kiện đã chọn:', selectedComponents);
//     setShowDeleteModal(false);
//     setSelectedComponents([]);
//     setSelectAll(false);
//   };

//   const handleRestoreDeleted = () => {
//     console.log('Khôi phục linh kiện đã xóa trong ngày');
//   };

//   const handleSelectComponent = (id: string) => {
//     setSelectedComponents(prev => 
//       prev.includes(id) 
//         ? prev.filter(compId => compId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedComponents([]);
//     } else {
//       setSelectedComponents(filteredComponents.map(comp => comp.id));
//     }
//     setSelectAll(!selectAll);
//   };

//   // Column management functions
//   const toggleColumnVisibility = (columnId: string) => {
//     setColumnConfig(prev => 
//       prev.map(column => 
//         column.id === columnId ? { ...column, visible: !column.visible } : column
//       )
//     );
//   };

//   const showAllColumns = () => {
//     setColumnConfig(prev => prev.map(column => ({ ...column, visible: true })));
//   };

//   const hideAllColumns = () => {
//     setColumnConfig(prev => prev.map(column => ({ ...column, visible: false })));
//   };

//   const resetToDefaultColumns = () => {
//     setColumnConfig([
//       { id: 'code', label: 'Mã SP', visible: true },
//       { id: 'name', label: 'Tên Sản Phẩm', visible: true },
//       { id: 'image', label: 'Ảnh Sản Phẩm', visible: true },
//       { id: 'category', label: 'Danh Mục', visible: true },
//       { id: 'attribute', label: 'Thuộc Tính', visible: true },
//       { id: 'retailPrice', label: 'Giá bán lẻ', visible: true },
//       { id: 'wholesalePrice', label: 'Giá Bán Buôn', visible: true },
//       { id: 'brand', label: 'Thương Hiệu', visible: true },
//       { id: 'warranty', label: 'Bảo Hành', visible: true },
//       { id: 'stock', label: 'Tồn Kho', visible: true },
//       { id: 'description', label: 'Mô Tả Sản Phẩm', visible: true },
//       { id: 'link', label: 'Link Sản Phẩm', visible: true },
//     ]);
//   };

//   // Image modal functions
//   const openImageModal = (component: Component, index: number = 0) => {
//     if (component.images && component.images.length > 0) {
//       setSelectedImage(component.images[index]);
//       setCurrentImageIndex(index);
//       setShowImageModal(true);
//     }
//   };

//   const closeImageModal = () => {
//     setShowImageModal(false);
//     setSelectedImage('');
//     setCurrentImageIndex(0);
//   };

//   const nextImage = (component: Component) => {
//     if (component.images) {
//       const nextIndex = (currentImageIndex + 1) % component.images.length;
//       setSelectedImage(component.images[nextIndex]);
//       setCurrentImageIndex(nextIndex);
//     }
//   };

//   const prevImage = (component: Component) => {
//     if (component.images) {
//       const prevIndex = (currentImageIndex - 1 + component.images.length) % component.images.length;
//       setSelectedImage(component.images[prevIndex]);
//       setCurrentImageIndex(prevIndex);
//     }
//   };

//   // Expand/collapse row functions
//   const toggleRowExpansion = (componentId: string) => {
//     setExpandedRows(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(componentId)) {
//         newSet.delete(componentId);
//       } else {
//         newSet.add(componentId);
//       }
//       return newSet;
//     });
//   };

//   const filteredComponents = showDeleted 
//     ? components.filter(comp => comp.deletedAt)
//     : components.filter(comp => !comp.deletedAt);

//   // Get visible columns
//   const visibleColumns = columnConfig.filter(column => column.visible);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//           <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
//             Quản lý Linh Kiện <span className="text-base font-normal text-gray-500">(3443 sản phẩm)</span>
//           </h1>
//           <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
//             <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap">
//               <Plus size={16} />
//               Thêm mới
//             </button>
//             <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
//               <Upload size={16} />
//               Nhập Excel
//             </button>
//             <button 
//               onClick={handleImportTemplate}
//               className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
//             >
//               <Download size={16} />
//               Excel mẫu
//             </button>
//             <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors whitespace-nowrap">
//               <Download size={16} />
//               Xuất Excel
//             </button>
//             <button 
//               onClick={handleDeleteAll}
//               className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
//             >
//               <Trash size={16} />
//               Xóa tất cả
//             </button>
//             {showDeleted && (
//               <button 
//                 onClick={handleRestoreDeleted}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors whitespace-nowrap"
//               >
//                 <RotateCcw size={16} />
//                 Khôi phục
//               </button>
//             )}
//             <div className="relative">
//               <button 
//                 className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
//                 onClick={() => setShowColumnSelector(!showColumnSelector)}
//               >
//                 <Eye size={16} />
//                 Chọn cột hiển thị
//                 <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
//                   {visibleColumns.length}/{columnConfig.length}
//                 </span>
//               </button>

//               {/* Column Selector Dropdown */}
//               {showColumnSelector && (
//                 <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                   <div className="p-4 border-b border-gray-200">
//                     <div className="flex items-center justify-between mb-3">
//                       <h3 className="font-semibold text-gray-900">Chọn cột hiển thị</h3>
//                       <button
//                         onClick={() => setShowColumnSelector(false)}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                     <div className="flex gap-2 mb-3">
//                       <button
//                         onClick={showAllColumns}
//                         className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//                       >
//                         Hiện tất cả
//                       </button>
//                       <button
//                         onClick={hideAllColumns}
//                         className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//                       >
//                         Ẩn tất cả
//                       </button>
//                       <button
//                         onClick={resetToDefaultColumns}
//                         className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
//                       >
//                         Mặc định
//                       </button>
//                     </div>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {columnConfig.map((column) => (
//                       <label
//                         key={column.id}
//                         className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
//                       >
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={column.visible}
//                             onChange={() => toggleColumnVisibility(column.id)}
//                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <span className="text-sm font-medium text-gray-700">
//                             {column.label}
//                           </span>
//                         </div>
//                         <div className={`w-2 h-2 rounded-full ${column.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
//                       </label>
//                     ))}
//                   </div>
//                   <div className="p-3 border-t border-gray-200 bg-gray-50">
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">
//                         Đã chọn {visibleColumns.length} cột
//                       </span>
//                       <button
//                         onClick={() => setShowColumnSelector(false)}
//                         className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
//                       >
//                         Áp dụng
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
//               <RefreshCw size={16} />
//               Làm mới
//             </button>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="space-y-4 mb-6">
//           <div className="flex flex-col lg:flex-row gap-4">
//             <div className="flex-1 relative min-w-0">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm linh kiện..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//             <div className="flex flex-wrap items-center gap-2">
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//               >
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//               <select
//                 value={selectedBrand}
//                 onChange={(e) => setSelectedBrand(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//               >
//                 {brands.map(brand => (
//                   <option key={brand} value={brand}>{brand}</option>
//                 ))}
//               </select>
//               <select
//                 value={stockStatus}
//                 onChange={(e) => setStockStatus(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//               >
//                 {stockStatuses.map(status => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>
//               <button
//                 onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
//                 className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
//                   showAdvancedFilter 
//                     ? 'bg-blue-100 text-blue-700 border-blue-300' 
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <Filter size={16} />
//                 Bộ lọc nâng cao
//               </button>
//               <button
//                 onClick={() => setShowDeleted(!showDeleted)}
//                 className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
//                   showDeleted 
//                     ? 'bg-red-100 text-red-700 border-red-300' 
//                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <Trash2 size={16} />
//                 {showDeleted ? 'Đang xem' : 'Đã xóa'} ({components.filter(c => c.deletedAt).length})
//               </button>
//             </div>
//           </div>

//           {/* Advanced Filter Panel */}
//           {showAdvancedFilter && (
//             <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá bán lẻ</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       placeholder="Từ"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Đến"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá bán buôn</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       placeholder="Từ"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Đến"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng tồn kho</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       placeholder="Từ"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Đến"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bảo hành</label>
//                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
//                     <option value="">Tất cả</option>
//                     <option value="6">6 tháng</option>
//                     <option value="12">12 tháng</option>
//                     <option value="24">24 tháng</option>
//                     <option value="na">Không bảo hành</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button 
//                   onClick={() => setShowAdvancedFilter(false)}
//                   className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Hủy
//                 </button>
//                 <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                   Áp dụng bộ lọc
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Selection Info */}
//         {selectedComponents.length > 0 && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <span className="text-blue-700 font-medium">
//                   Đã chọn {selectedComponents.length} linh kiện
//                 </span>
//               </div>
//               <button
//                 onClick={() => setSelectedComponents([])}
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 Bỏ chọn tất cả
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Components Table */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={handleSelectAll}
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                   </th>
//                   {/* Dynamic table headers based on column config */}
//                   {columnConfig.map((column) => 
//                     column.visible && (
//                       <th 
//                         key={column.id}
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         {column.label}
//                       </th>
//                     )
//                   )}
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Hành Động</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredComponents.map((component) => {
//                   const isExpanded = expandedRows.has(component.id);
                  
//                   return (
//                     <React.Fragment key={component.id}>
//                       {/* Main Row */}
//                       <tr 
//                         className={`hover:bg-gray-50 cursor-pointer ${component.deletedAt ? 'bg-red-50' : ''} ${
//                           isExpanded ? 'bg-blue-50' : ''
//                         }`}
//                         onClick={() => toggleRowExpansion(component.id)}
//                       >
//                         <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
//                           <input
//                             type="checkbox"
//                             checked={selectedComponents.includes(component.id)}
//                             onChange={() => handleSelectComponent(component.id)}
//                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                           />
//                         </td>
                        
//                         {/* Dynamic table cells based on column config */}
//                         {columnConfig.map((column) => 
//                           column.visible && (
//                             <td key={column.id} className="px-4 py-3 text-sm align-top">
//                               {column.id === 'code' && (
//                                 <>
//                                   {component.deletedAt && (
//                                     <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" title="Đã xóa"></span>
//                                   )}
//                                   <span className="font-mono text-gray-900">{component.code}</span>
//                                 </>
//                               )}
//                               {column.id === 'name' && (
//                                 <span className="font-medium text-gray-900">{component.name}</span>
//                               )}
//                               {column.id === 'image' && (
//                                 <div className="flex items-center gap-2">
//                                   {component.images && component.images.length > 0 ? (
//                                     <>
//                                       <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
//                                         <ImageIcon size={16} className="text-gray-400" />
//                                       </div>
//                                       <button
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           openImageModal(component);
//                                         }}
//                                         className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
//                                       >
//                                         <Eye size={12} />
//                                         Xem ảnh ({component.images.length})
//                                       </button>
//                                     </>
//                                   ) : (
//                                     <span className="text-gray-400 text-sm">Không có ảnh</span>
//                                   )}
//                                 </div>
//                               )}
//                               {column.id === 'category' && (
//                                 <span className="text-gray-600">{component.category}</span>
//                               )}
//                               {column.id === 'attribute' && (
//                                 <span className="text-gray-600">{component.attribute}</span>
//                               )}
//                               {column.id === 'retailPrice' && (
//                                 <span className="font-semibold text-gray-900">{component.retailPrice.toLocaleString()} ₫</span>
//                               )}
//                               {column.id === 'wholesalePrice' && (
//                                 <span className="font-semibold text-gray-900">{component.wholesalePrice.toLocaleString()} ₫</span>
//                               )}
//                               {column.id === 'brand' && (
//                                 <span className="text-gray-600">{component.brand}</span>
//                               )}
//                               {column.id === 'warranty' && (
//                                 <span className="text-gray-600">{component.warranty}</span>
//                               )}
//                               {column.id === 'stock' && (
//                                 <span className={getStockClass(component.stock)}>
//                                   {component.stock}
//                                 </span>
//                               )}
//                               {column.id === 'description' && (
//                                 <div className="text-gray-600 line-clamp-2 max-w-xs">
//                                   {component.description || '-'}
//                                 </div>
//                               )}
//                               {column.id === 'link' && component.productLink && (
//                                 <div className="flex items-center gap-2">
//                                   <a
//                                     href={component.productLink}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     onClick={(e) => e.stopPropagation()}
//                                     className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
//                                   >
//                                     <ExternalLink size={14} />
//                                     Truy cập
//                                   </a>
//                                 </div>
//                               )}
//                             </td>
//                           )
//                         )}
                        
//                         <td className="px-4 py-3 text-sm align-top" onClick={(e) => e.stopPropagation()}>
//                           <div className="flex gap-1">
//                             {component.deletedAt ? (
//                               <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
//                                 <RotateCcw size={12} />
//                                 Khôi phục
//                               </button>
//                             ) : (
//                               <>
//                                 <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
//                                   <Edit size={12} />
//                                   Sửa
//                                 </button>
//                                 <button className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
//                                   <Trash2 size={12} />
//                                   Xóa
//                                 </button>
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>

//                       {/* Expanded Row - Image Preview */}
//                       {isExpanded && component.images && component.images.length > 0 && (
//                         <tr className="bg-blue-25 border-b border-blue-100">
//                           <td colSpan={visibleColumns.length + 2} className="px-4 py-4">
//                             <div className="flex flex-col gap-4">
//                               <div className="flex items-center justify-between">
//                                 <h4 className="font-semibold text-gray-900">Ảnh sản phẩm</h4>
//                                 <button
//                                   onClick={() => openImageModal(component)}
//                                   className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                                 >
//                                   <Eye size={14} />
//                                   Xem toàn màn hình
//                                 </button>
//                               </div>
                              
//                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                                 {component.images.map((image, index) => (
//                                   <div 
//                                     key={index}
//                                     className="relative group cursor-pointer"
//                                     onClick={() => openImageModal(component, index)}
//                                   >
//                                     <img
//                                       src={image}
//                                       alt={`${component.name} ${index + 1}`}
//                                       className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
//                                     />
//                                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
//                                     <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//                                       {index + 1}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
//           <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
//             <option value="10">10 dòng</option>
//             <option value="25">25 dòng</option>
//             <option value="50">50 dòng</option>
//             <option value="100">100 dòng</option>
//           </select>
//           <div className="text-sm text-gray-600">
//             Hiển thị 1-15 của 3443 sản phẩm
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <ChevronLeft size={16} />
//             </button>
//             <span className="text-sm text-gray-600">Trang 1 / 230</span>
//             <button className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-700 mb-4">
//                 {selectedComponents.length > 0 
//                   ? `Bạn có chắc chắn muốn xóa ${selectedComponents.length} linh kiện đã chọn?`
//                   : 'Bạn có chắc chắn muốn xóa tất cả linh kiện?'
//                 }
//               </p>
//               <p className="text-sm text-red-600 mb-4">
//                 ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị mất vĩnh viễn.
//               </p>
//               {selectedComponents.length === 0 && (
//                 <div className="flex items-center gap-2 mb-4">
//                   <input
//                     type="checkbox"
//                     id="keepSome"
//                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor="keepSome" className="text-sm text-gray-700">
//                     Giữ lại một số linh kiện quan trọng
//                   </label>
//                 </div>
//               )}
//             </div>
//             <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Xác nhận xóa
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Modal */}
//       {showImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="flex items-center justify-between p-4 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Xem ảnh sản phẩm</h3>
//               <button
//                 onClick={closeImageModal}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>
            
//             <div className="p-6">
//               <div className="flex flex-col lg:flex-row gap-6">
//                 {/* Main Image */}
//                 <div className="flex-1 flex flex-col items-center">
//                   <div className="relative bg-gray-100 rounded-lg overflow-hidden max-w-md w-full">
//                     <img
//                       src={selectedImage}
//                       alt="Product"
//                       className="w-full h-auto max-h-96 object-contain"
//                     />
                    
//                     {/* Navigation Arrows */}
//                     {components.find(comp => comp.images?.includes(selectedImage))?.images && 
//                      components.find(comp => comp.images?.includes(selectedImage))!.images!.length > 1 && (
//                       <>
//                         <button
//                           onClick={() => prevImage(components.find(comp => comp.images?.includes(selectedImage))!)}
//                           className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
//                         >
//                           <ChevronLeft size={24} />
//                         </button>
//                         <button
//                           onClick={() => nextImage(components.find(comp => comp.images?.includes(selectedImage))!)}
//                           className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
//                         >
//                           <ChevronRight size={24} />
//                         </button>
//                       </>
//                     )}
//                   </div>
                  
//                   {/* Image Counter */}
//                   {components.find(comp => comp.images?.includes(selectedImage))?.images && (
//                     <div className="mt-4 text-sm text-gray-600">
//                       Ảnh {currentImageIndex + 1} / {components.find(comp => comp.images?.includes(selectedImage))!.images!.length}
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Thumbnails */}
//                 {components.find(comp => comp.images?.includes(selectedImage))?.images && 
//                  components.find(comp => comp.images?.includes(selectedImage))!.images!.length > 1 && (
//                   <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
//                     {components.find(comp => comp.images?.includes(selectedImage))!.images!.map((image, index) => (
//                       <button
//                         key={index}
//                         onClick={() => {
//                           setSelectedImage(image);
//                           setCurrentImageIndex(index);
//                         }}
//                         className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
//                           currentImageIndex === index ? 'border-blue-500' : 'border-gray-300'
//                         }`}
//                       >
//                         <img
//                           src={image}
//                           alt={`Thumbnail ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ComponentManagement;