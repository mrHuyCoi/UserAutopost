import React from 'react';
import { Edit, Trash2, RotateCcw, Eye, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Component, ColumnConfig } from '../types';

interface TableRowProps {
  component: Component;
  columnConfig: ColumnConfig[];
  visibleColumns: ColumnConfig[];
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

const TableRow: React.FC<TableRowProps> = ({
  component,
  columnConfig,
  visibleColumns,
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

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderCellContent = (columnId: string) => {
    switch (columnId) {
      case 'code':
        return (
          <>
            {component.deletedAt && (
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" title="Đã xóa"></span>
            )}
            <span className="font-mono text-gray-900">{component.code}</span>
          </>
        );
      
      case 'name':
        return <span className="font-medium text-gray-900">{component.name}</span>;
      
      case 'image':
        return (
          <div className="flex items-center gap-2">
            {component.images && component.images.length > 0 ? (
              <>
                <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <ImageIcon size={16} className="text-gray-400" />
                </div>
                <button
                  onClick={handleImageClick}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <Eye size={12} />
                  Xem ảnh ({component.images.length})
                </button>
              </>
            ) : (
              <span className="text-gray-400 text-sm">Không có ảnh</span>
            )}
          </div>
        );
      
      case 'category':
        return <span className="text-gray-600">{component.category}</span>;
      
      case 'attribute':
        return <span className="text-gray-600">{component.attribute}</span>;
      
      case 'retailPrice':
        return <span className="font-semibold text-gray-900">{component.retailPrice.toLocaleString()} ₫</span>;
      
      case 'wholesalePrice':
        return <span className="font-semibold text-gray-900">{component.wholesalePrice.toLocaleString()} ₫</span>;
      
      case 'brand':
        return <span className="text-gray-600">{component.brand}</span>;
      
      case 'warranty':
        return <span className="text-gray-600">{component.warranty}</span>;
      
      case 'stock':
        return <span className={getStockClass(component.stock)}>{component.stock}</span>;
      
      case 'description':
        return (
          <div className="text-gray-600 line-clamp-2 max-w-xs">
            {component.description || '-'}
          </div>
        );
      
      case 'link':
        return component.productLink ? (
          <div className="flex items-center gap-2">
            <a
              href={component.productLink}
              onClick={(e) => handleLinkClick(e, component.productLink!)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink size={14} />
              Truy cập
            </a>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer ${component.deletedAt ? 'bg-red-50' : ''} ${
        isExpanded ? 'bg-blue-50' : ''
      }`}
      onClick={() => onToggleExpansion(component.id)}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      
      {columnConfig.map((column) => 
        column.visible && (
          <td key={column.id} className="px-4 py-3 text-sm align-top">
            {renderCellContent(column.id)}
          </td>
        )
      )}
      
      <td className="px-4 py-3 text-sm align-top" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          {component.deletedAt ? (
            <button 
              onClick={(e) => handleActionClick(e, () => onRestore(component.id))}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              <RotateCcw size={12} />
              Khôi phục
            </button>
          ) : (
            <>
              <button 
                onClick={(e) => handleActionClick(e, () => onEdit(component.id))}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <Edit size={12} />
                Sửa
              </button>
              <button 
                onClick={(e) => handleActionClick(e, () => onDelete(component.id))}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 size={12} />
                Xóa
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;