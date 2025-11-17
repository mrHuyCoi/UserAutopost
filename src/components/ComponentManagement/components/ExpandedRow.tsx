import React from 'react';
import { Eye } from 'lucide-react';
import { Component } from '../types';

interface ExpandedRowProps {
  component: Component;
  visibleColumnsCount: number;
  onOpenImageModal: (component: Component, index?: number) => void;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  component,
  visibleColumnsCount,
  onOpenImageModal,
}) => {
  return (
    <tr className="bg-blue-25 border-b border-blue-100">
      <td colSpan={visibleColumnsCount} className="px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Ảnh sản phẩm</h4>
            <button
              onClick={() => onOpenImageModal(component)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Eye size={14} />
              Xem toàn màn hình
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {component.images!.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onClick={() => onOpenImageModal(component, index)}
              >
                <img
                  src={image}
                  alt={`${component.name} ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRow;