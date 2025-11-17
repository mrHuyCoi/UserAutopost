import React, { useState } from 'react';
import { Plus, Upload, Download, Trash, RotateCcw, Eye, RefreshCw, Menu, X, Package } from 'lucide-react';

interface HeaderProps {
  showDeleted: boolean;
  deletedCount: number;
  onAddNew: () => void;
  onImportExcel: () => void;
  onExportTemplate: () => void;
  onExportExcel: () => void;
  onDeleteAll: () => void;
  onRestoreDeleted: () => void;
  onShowColumnSelector: () => void;
  onRefresh: () => void;
  visibleColumnsCount: number;
  totalColumnsCount: number;
  totalProducts?: number;
}

const Header: React.FC<HeaderProps> = ({
  showDeleted,
  deletedCount,
  onAddNew,
  onImportExcel,
  onExportTemplate,
  onExportExcel,
  onDeleteAll,
  onRestoreDeleted,
  onShowColumnSelector,
  onRefresh,
  visibleColumnsCount,
  totalColumnsCount,
  totalProducts = 3443,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                Quản lý Linh Kiện
                {showDeleted && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                    Đã xóa
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {totalProducts.toLocaleString()} sản phẩm
                </span>
                {showDeleted && deletedCount > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-red-500 font-medium">
                      {deletedCount} đã xóa
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 justify-end">
          <PrimaryButtons
            onAddNew={onAddNew}
            onImportExcel={onImportExcel}
            onExportTemplate={onExportTemplate}
            onExportExcel={onExportExcel}
            onDeleteAll={onDeleteAll}
            showDeleted={showDeleted}
            onRestoreDeleted={onRestoreDeleted}
            deletedCount={deletedCount}
          />
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <UtilityButtons
            onShowColumnSelector={onShowColumnSelector}
            onRefresh={onRefresh}
            visibleColumnsCount={visibleColumnsCount}
            totalColumnsCount={totalColumnsCount}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-4 shadow-lg animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Tác vụ</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {visibleColumnsCount}/{totalColumnsCount} cột
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <PrimaryButtons
              onAddNew={onAddNew}
              onImportExcel={onImportExcel}
              onExportTemplate={onExportTemplate}
              onExportExcel={onExportExcel}
              onDeleteAll={onDeleteAll}
              showDeleted={showDeleted}
              onRestoreDeleted={onRestoreDeleted}
              deletedCount={deletedCount}
              mobile
            />
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <UtilityButtons
                onShowColumnSelector={onShowColumnSelector}
                onRefresh={onRefresh}
                visibleColumnsCount={visibleColumnsCount}
                totalColumnsCount={totalColumnsCount}
                mobile
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Primary Buttons Component
const PrimaryButtons: React.FC<{
  onAddNew: () => void;
  onImportExcel: () => void;
  onExportTemplate: () => void;
  onExportExcel: () => void;
  onDeleteAll: () => void;
  showDeleted: boolean;
  onRestoreDeleted: () => void;
  deletedCount: number;
  mobile?: boolean;
}> = ({ mobile = false, deletedCount, ...props }) => {
  const getButtonClass = (color: string) => {
    const baseClass = mobile 
      ? "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap justify-center text-xs shadow-sm hover:shadow-md active:scale-95"
      : "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95";
    
    const colors: { [key: string]: string } = {
      green: "bg-green-600 text-white hover:bg-green-700 border border-green-600",
      blue: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
      purple: "bg-purple-600 text-white hover:bg-purple-700 border border-purple-600",
      yellow: "bg-yellow-500 text-white hover:bg-yellow-600 border border-yellow-500",
      red: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
      teal: "bg-teal-500 text-white hover:bg-teal-600 border border-teal-500",
    };
    
    return `${baseClass} ${colors[color]}`;
  };

  return (
    <>
      {/* <button onClick={props.onAddNew} className={getButtonClass('green')}>
        <Plus size={mobile ? 14 : 16} />
        {mobile ? 'Thêm' : 'Thêm mới'}
      </button> */}
      <button onClick={props.onImportExcel} className={getButtonClass('blue')}>
        <Upload size={mobile ? 14 : 16} />
        {mobile ? 'Nhập' : 'Nhập Excel'}
      </button>
      <button onClick={props.onExportTemplate} className={getButtonClass('purple')}>
        <Download size={mobile ? 14 : 16} />
        {mobile ? 'Mẫu' : 'Excel mẫu'}
      </button>
      <button onClick={props.onExportExcel} className={getButtonClass('yellow')}>
        <Download size={mobile ? 14 : 16} />
        {mobile ? 'Xuất' : 'Xuất Excel'}
      </button>
      <button onClick={props.onDeleteAll} className={getButtonClass('red')}>
        <Trash size={mobile ? 14 : 16} />
        {mobile ? 'Xóa' : 'Xóa tất cả'}
      </button>
      {props.showDeleted && (
        <button onClick={props.onRestoreDeleted} className={getButtonClass('teal')}>
          <RotateCcw size={mobile ? 14 : 16} />
          {mobile ? `Khôi phục (${deletedCount})` : `Khôi phục (${deletedCount})`}
        </button>
      )}
    </>
  );
};

// Utility Buttons Component
const UtilityButtons: React.FC<{
  onShowColumnSelector: () => void;
  onRefresh: () => void;
  visibleColumnsCount: number;
  totalColumnsCount: number;
  mobile?: boolean;
}> = ({ mobile = false, ...props }) => {
  const buttonClass = mobile
    ? "flex items-center gap-2 px-3 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 whitespace-nowrap justify-center text-xs shadow-sm hover:shadow-md active:scale-95"
    : "flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md active:scale-95";

  return (
    <>
      <button onClick={props.onShowColumnSelector} className={buttonClass}>
        <Eye size={mobile ? 14 : 16} />
        {mobile ? 'Hiển thị cột' : 'Chọn cột'}
        <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
          {props.visibleColumnsCount}/{props.totalColumnsCount}
        </span>
      </button>
      <button onClick={props.onRefresh} className={buttonClass}>
        <RefreshCw size={mobile ? 14 : 16} />
        {mobile ? 'Làm mới' : 'Làm mới'}
      </button>
    </>
  );
};

export default Header;