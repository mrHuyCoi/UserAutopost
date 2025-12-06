import React from 'react';
import { DeviceInfoFormData, Material } from '../../types';
import { X, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface DeviceFormProps {
  formData: Omit<DeviceInfoFormData, 'materials'>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  availableMaterials?: Material[];
  onMaterialsChange?: (materials: Material[]) => void;
  selectedMaterials?: Material[];
  deviceId?: string | null;
}

interface BaseField {
  name: keyof Omit<DeviceInfoFormData, 'materials'>;
  label: string;
  colSpan: string;
  required?: boolean;
}

interface TextField extends BaseField {
  type: 'text';
  placeholder: string;
}

interface NumberField extends BaseField {
  type: 'number';
  placeholder: string;
  min?: number;
}

interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

interface TextAreaField extends BaseField {
  type: 'textarea';
  placeholder: string;
  rows?: number;
}

type FormField = TextField | NumberField | SelectField | TextAreaField;

interface FormSection {
  title: string;
  fields: FormField[];
}

const isFieldRequired = (field: FormField): boolean => field.required === true;

// Gợi ý màu – người dùng vẫn có thể nhập tự do
const COLOR_SUGGESTIONS = [
  'Titanium Blue','Natural Titanium','Black','White','Purple','Red',
  'Gold','Silver','Space Gray','Midnight','Starlight','Blue','Pink','Green'
];

export const DeviceForm: React.FC<DeviceFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onCancel,
  isEditing = false,
  isLoading = false,
  availableMaterials = [],
  onMaterialsChange,
  selectedMaterials = []
}) => {
  const [localMaterials, setLocalMaterials] = React.useState<Material[]>(selectedMaterials);
  const [newMaterialName, setNewMaterialName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMaterialsChange?.(localMaterials);
    onSubmit(e);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn đặt lại tất cả thông tin?')) {
      setLocalMaterials([]);
      setNewMaterialName('');
      Object.keys(formData).forEach(key => {
        const event = {
          target: { name: key, value: '' }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      });
    }
  };

  const handleAddMaterial = () => {
    const name = newMaterialName.trim();
    if (!name || localMaterials.find(m => m.name === name)) return;

    const newMaterial: Material = {
      id: `temp-${Date.now()}`,
      name,
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      selected: false
    };
    const updated = [...localMaterials, newMaterial];
    setLocalMaterials(updated);
    setNewMaterialName('');
    onMaterialsChange?.(updated);
  };

  const handleRemoveMaterial = (materialId: string) => {
    const updated = localMaterials.filter(m => m.id !== materialId);
    setLocalMaterials(updated);
    onMaterialsChange?.(updated);
  };

  const handleSelectExistingMaterial = (material: Material) => {
    if (localMaterials.find(m => m.id === material.id)) return;
    const updated = [...localMaterials, material];
    setLocalMaterials(updated);
    onMaterialsChange?.(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMaterial();
    }
  };

  const inputClasses =
    "w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

  const labelClasses =
    "block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2";

  const formSections: FormSection[] = [
    {
      title: "Thông tin cơ bản",
      fields: [
        {
          name: "model",
          label: "Tên/mã mẫu máy",
          type: "text",
          placeholder: "VD: iPhone 15 Pro Max",
          required: true,
          colSpan: "md:col-span-2"
        },
        {
          name: "brand",
          label: "Hãng sản xuất",
          type: "text",
          placeholder: "Apple, Samsung, Xiaomi...",
          required: true,
          colSpan: "md:col-span-1"
        },
        {
          name: "release_date",
          label: "Ngày ra mắt",
          type: "text",
          placeholder: "Tháng/Năm — VD: 09/2024",
          colSpan: "md:col-span-1"
        },
        {
          name: "warranty",
          label: "Bảo hành",
          type: "text",
          placeholder: "VD: 12 tháng chính hãng hoặc theo cửa hàng",
          colSpan: "md:col-span-1"
        }
      ]
    },
    {
      title: "Thông số kỹ thuật",
      fields: [
        {
          name: "screen",
          label: "Màn hình",
          type: "text",
          placeholder: "Kích thước, công nghệ, tần số quét...",
          colSpan: "md:col-span-1"
        },
        {
          name: "chip_ram",
          label: "Chip, RAM",
          type: "text",
          placeholder: "VD: A17 Pro, 8GB RAM...",
          colSpan: "md:col-span-1"
        },
        {
          name: "camera",
          label: "Camera",
          type: "text",
          placeholder: "Thông số camera trước/sau...",
          colSpan: "md:col-span-1"
        },
        {
          name: "battery",
          label: "Pin",
          type: "text",
          placeholder: "Dung lượng, công nghệ sạc...",
          colSpan: "md:col-span-1"
        },
        {
          name: "connectivity_os",
          label: "Kết nối, Hệ điều hành",
          type: "text",
          placeholder: "Chuẩn kết nối, phiên bản OS...",
          colSpan: "md:col-span-1"
        },
        // ĐÃ CHUYỂN sang input tự do + gợi ý
        {
          name: "color_english",
          label: "Màu sắc (Tiếng Anh)",
          type: "text",
          placeholder: "Nhập màu bất kỳ (có gợi ý)…",
          colSpan: "md:col-span-1"
        },
        {
          name: "dimensions_weight",
          label: "Kích thước, Trọng lượng",
          type: "text",
          placeholder: "VD: 146.6 x 70.6 x 8.3 mm, 187g",
          colSpan: "md:col-span-1"
        },
        {
          name: "sensors_health_features",
          label: "Cảm biến & Tính năng sức khỏe",
          type: "textarea",
          placeholder: "VD: Face ID, Gia tốc kế, Nhịp tim, SpO2, ECG, GPS, NFC...",
          rows: 3,
          colSpan: "md:col-span-2"
        }
      ]
    },
    {
      title: "Vật liệu",
      fields: []
    }
  ];

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.name];
    const stringValue = typeof fieldValue === 'string' ? fieldValue : '';

    const commonProps = {
      id: field.name,
      name: field.name,
      value: stringValue,
      onChange,
      className: inputClasses,
      disabled: isLoading,
      required: field.required
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            {(field as SelectField).options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            placeholder={(field as NumberField).placeholder}
            min={(field as NumberField).min}
          />
        );
      case 'text': {
        // Nếu là trường màu sắc, thêm datalist gợi ý nhưng vẫn cho nhập tự do
        const isColorField = field.name === 'color_english';
        return (
          <>
            <input
              {...commonProps}
              type="text"
              list={isColorField ? 'color-suggestions' : undefined}
              placeholder={(field as TextField).placeholder}
            />
            {isColorField && (
              <datalist id="color-suggestions">
                {COLOR_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
          </>
        );
      }
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={(field as TextAreaField).placeholder}
            rows={(field as TextAreaField).rows || 3}
            className={`${inputClasses} resize-none`}
          />
        );
      default:
        return null;
    }
  };

  const isFormValid = (): boolean => {
    const requiredFields = formSections
      .flatMap(section => section.fields)
      .filter(field => isFieldRequired(field));
    return requiredFields.every(field => {
      const value = formData[field.name];
      return typeof value === 'string' && value.trim() !== '';
    });
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-y-auto max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b bg-gray-50">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            {isEditing ? 'Cập nhật thông tin thiết bị' : 'Thêm thông tin thiết bị mới'}
          </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              {isEditing ? 'Chỉnh sửa thông tin chi tiết thiết bị' : 'Điền đầy đủ thông tin trước khi lưu'}
            </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Đóng"
        >
          <X size={18} className="text-gray-600 hover:text-gray-800 transition" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {formSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 border-b pb-1 sm:pb-2">
              {section.title}
            </h3>

            {section.title === 'Vật liệu' ? (
              <div className="space-y-4">
                {/* Thêm vật liệu mới */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tên vật liệu mới..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    disabled={!newMaterialName.trim() || isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Thêm
                  </button>
                </div>

                {/* Danh sách vật liệu có sẵn */}
                {availableMaterials.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Vật liệu có sẵn:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableMaterials.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => handleSelectExistingMaterial(material)}
                          disabled={!!localMaterials.find(m => m.id === material.id) || isLoading}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {material.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Danh sách vật liệu đã chọn */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Vật liệu đã chọn ({localMaterials.length}):
                  </p>
                  {localMaterials.length === 0 ? (
                    <p className="text-gray-400 text-sm">Chưa có vật liệu nào được chọn</p>
                  ) : (
                    <div className="space-y-2">
                      {localMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{material.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(material.id)}
                            disabled={isLoading}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition"
                            title="Xóa vật liệu"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                {section.fields.map((field) => (
                  <div key={field.name as string} className={field.colSpan}>
                    <label htmlFor={field.name as string} className={labelClasses}>
                      {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Validation Message */}
        {!isFormValid() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc (có dấu *)
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 border-top border-gray-200 gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            Đặt lại
          </button>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 sm:flex-none border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
            >
              <Save size={14} />
              {isLoading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm thiết bị')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
