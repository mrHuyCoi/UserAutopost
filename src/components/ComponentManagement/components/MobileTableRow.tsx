import React from 'react';
import { Edit, Trash2, RotateCcw, Eye, Image as ImageIcon, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Component } from '../types';

interface MobileTableRowProps {
  component: Component;
  isSelected: boolean;
  isExpanded: boolean;
  getStockClass: (stock: number) => string;
  onSelect: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onOpenImageModal: (component: Component, index?: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const MobileTableRow: React.FC<MobileTableRowProps> = ({
  component,
  isSelected,
  isExpanded,
  getStockClass,
  onSelect,
  onToggleExpansion,
  onOpenImageModal,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenImageModal(component);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`p-4 border-b border-gray-200 ${component.deletedAt ? 'bg-red-50' : ''} ${
        isExpanded ? 'bg-blue-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {component.deletedAt && (
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title="Đã xóa"></span>
              )}
              <span className="font-mono text-sm font-medium text-gray-900">{component.code}</span>
            </div>
            <h3 className="font-medium text-gray-900 text-sm leading-tight">{component.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{component.category}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleExpansion(component.id)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">Giá bán lẻ:</span>
          <div className="font-semibold text-gray-900">{component.retailPrice.toLocaleString()} ₫</div>
        </div>
        <div>
          <span className="text-gray-500">Tồn kho:</span>
          <div className={getStockClass(component.stock)}>{component.stock}</div>
        </div>
        <div>
          <span className="text-gray-500">Thương hiệu:</span>
          <div className="text-gray-900">{component.brand}</div>
        </div>
        <div>
          <span className="text-gray-500">Bảo hành:</span>
          <div className="text-gray-900">{component.warranty}</div>
        </div>
      </div>

      {/* Images */}
      {component.images && component.images.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Ảnh sản phẩm ({component.images.length})</span>
            <button
              onClick={handleImageClick}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              <Eye size={12} />
              Xem ảnh
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {component.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${component.name} ${index + 1}`}
                className="w-16 h-16 object-cover rounded border border-gray-200"
                onClick={() => onOpenImageModal(component, index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        {component.deletedAt ? (
          <button 
            onClick={(e) => handleActionClick(e, () => onRestore(component.id))}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            <RotateCcw size={12} />
            Khôi phục
          </button>
        ) : (
          <>
            <button 
              onClick={(e) => handleActionClick(e, () => onEdit(component.id))}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Edit size={12} />
              Sửa
            </button>
            <button 
              onClick={(e) => handleActionClick(e, () => onDelete(component.id))}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <Trash2 size={12} />
              Xóa
            </button>
          </>
        )}
        {component.productLink && (
          <a
            href={component.productLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Mô tả:</span>
              <p className="text-gray-700 mt-1">{component.description || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Thuộc tính:</span>
              <p className="text-gray-700 mt-1">{component.attribute}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Giá bán buôn:</span>
              <p className="font-semibold text-gray-900">{component.wholesalePrice.toLocaleString()} ₫</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTableRow;