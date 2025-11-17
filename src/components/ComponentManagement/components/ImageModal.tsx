import React from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Component } from '../types';

interface ImageModalProps {
  isOpen: boolean;
  selectedImage: string;
  currentImageIndex: number;
  component?: Component;
  onClose: () => void;
  onNextImage: (component: Component) => void;
  onPrevImage: (component: Component) => void;
  onSelectImage: (image: string, index: number) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  selectedImage,
  currentImageIndex,
  component,
  onClose,
  onNextImage,
  onPrevImage,
  onSelectImage,
}) => {
  if (!isOpen || !component) return null;

  const images = component.images || [];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as HTMLElement).setAttribute('data-touch-x', touch.clientX.toString());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchX = parseInt((e.currentTarget as HTMLElement).getAttribute('data-touch-x') || '0');
    const endX = e.changedTouches[0].clientX;
    const diff = touchX - endX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        onNextImage(component);
      } else {
        onPrevImage(component);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {component.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-auto">
          {/* Main Image */}
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="relative bg-gray-100 rounded-lg overflow-hidden w-full max-w-md"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={selectedImage}
                alt="Product"
                className="w-full h-auto max-h-80 sm:max-h-96 object-contain"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => onPrevImage(component)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors hidden sm:block"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => onNextImage(component)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors hidden sm:block"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Mobile Swipe Indicators */}
              {images.length > 1 && (
                <div className="sm:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Image Counter and Download */}
            <div className="flex items-center justify-between w-full max-w-md mt-3">
              <div className="text-sm text-gray-600">
                Ảnh {currentImageIndex + 1} / {images.length}
              </div>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedImage;
                  link.download = `${component.name}-${currentImageIndex + 1}.jpg`;
                  link.click();
                }}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <Download size={14} />
                Tải xuống
              </button>
            </div>

            {/* Mobile Navigation Buttons */}
            {images.length > 1 && (
              <div className="sm:hidden flex gap-4 mt-4">
                <button
                  onClick={() => onPrevImage(component)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                <button
                  onClick={() => onNextImage(component)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Thumbnails - Hidden on mobile, show on desktop */}
          {images.length > 1 && (
            <div className="hidden lg:flex lg:flex-col gap-2 w-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tất cả ảnh</h4>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onSelectImage(image, index)}
                  className={`flex-shrink-0 w-full h-20 border-2 rounded-lg overflow-hidden ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;