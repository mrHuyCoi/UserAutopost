// src/components/QRModal.tsx
import React from 'react';
import { ScanLine } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  connectionStatus: 'waiting' | 'connected'; // giữ prop cũ để không phá UI
  onClose: () => void;
  onConnectionComplete: () => void;
  // mới: nhận image + phase + msg từ hook
  image?: string | null;
  phase?: 'idle' | 'waiting' | 'connected';
  messageHint?: string | null;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  connectionStatus,
  onClose,
  onConnectionComplete,
  image,
  phase = 'waiting',
  messageHint,
}) => {
  if (!isOpen) return null;

  const isConnected = phase === 'connected' || connectionStatus === 'connected';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Kết nối Zalo qua QR Code</h3>
            <button
              aria-label="Đóng"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 text-center">
          {!isConnected ? (
            <>
              <div className="bg-gray-100 rounded-xl p-6 mb-6 flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Zalo QR" className="w-48 h-48 rounded-md" />
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                    <ScanLine size={64} />
                  </div>
                )}
              </div>
              {messageHint && <p className="text-xs text-gray-500 mb-3">Mã: {messageHint}</p>}
              <div className="space-y-3">
                <p className="text-gray-700 font-medium">Hướng dẫn kết nối:</p>
                <ol className="text-sm text-gray-600 text-left space-y-2">
                  <li>1. Mở ứng dụng Zalo trên điện thoại</li>
                  <li>2. Nhấn vào biểu tượng QR Code</li>
                  <li>3. Quét mã QR này để kết nối</li>
                  <li>4. Xác nhận kết nối trên điện thoại</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 rounded-xl p-8 mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-semibold">Kết nối thành công!</p>
              </div>
              <p className="text-gray-600 mb-6">
                Tài khoản Zalo đã được kết nối với hệ thống. Bạn có thể bắt đầu quản lý hội thoại ngay bây giờ.
              </p>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          {isConnected ? (
            <button
              onClick={() => {
                onConnectionComplete();
                onClose();
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Hoàn tất
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
