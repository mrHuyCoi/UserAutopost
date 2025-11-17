import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
}) => {
  const [keepSome, setKeepSome] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    setKeepSome(false);
  };

  const handleClose = () => {
    onClose();
    setKeepSome(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {selectedCount > 0 
              ? `Bạn có chắc chắn muốn xóa ${selectedCount} linh kiện đã chọn?`
              : 'Bạn có chắc chắn muốn xóa tất cả linh kiện?'
            }
          </p>
          <p className="text-sm text-red-600 mb-4">
            ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị mất vĩnh viễn.
          </p>
          {selectedCount === 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="keepSome"
                checked={keepSome}
                onChange={(e) => setKeepSome(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="keepSome" className="text-sm text-gray-700">
                Giữ lại một số linh kiện quan trọng
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;