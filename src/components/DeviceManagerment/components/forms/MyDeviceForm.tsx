// MyDeviceForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { userDeviceService } from "../../../../services/userDeviceService";
import { deviceService } from "../../../../services/deviceService";
import { colorService } from "../../../../services/colorService";
import { deviceStorageService } from "../../../../services/deviceStorageService";

interface DeviceOption {
  id?: string;
  model?: string;
}

interface ColorOption {
  id?: string;
  name?: string;
}

interface StorageOption {
  id?: string;
  capacity?: number;
}

interface MyDeviceFormProps {
  onClose?: () => void;
  formData?: any;
  onSubmit?: (e: React.FormEvent) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  editMode?: boolean;
  deviceId?: string;
  initialData?: any;
}

const INITIAL_FORM = {
  device_info_id: "",
  color_id: "",
  storage_id: "",
  device_type: "",
  warranty: "",
  device_condition: "",
  battery_condition: "",
  price: "",
  wholesale_price: "",
  inventory: "",
  notes: "",
};

const toNumberOrNull = (v: any) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeBattery = (v: string) => {
  if (!v) return null;
  const cleaned = v.replace(/[^\d]/g, ""); // bỏ %, khoảng trắng...
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const formatDeviceForForm = (device: any) => {
  // Một số API trả về trong field data
  const deviceData = device?.data || device;

  return {
    device_info_id: deviceData?.device_info?.id || deviceData?.device_info_id || "",
    color_id: deviceData?.color?.id || deviceData?.color_id || "",
    // Ưu tiên device_storage_id theo BE
    storage_id:
      deviceData?.device_storage?.id ||
      deviceData?.device_storage_id ||
      deviceData?.storage_id ||
      "",
    device_type: deviceData?.device_type || "",
    warranty: deviceData?.warranty || "",
    device_condition: deviceData?.device_condition || "",
    battery_condition:
      typeof deviceData?.battery_condition === "number"
        ? String(deviceData?.battery_condition)
        : (deviceData?.battery_condition || ""),
    price: deviceData?.price != null ? String(deviceData?.price) : "",
    wholesale_price: deviceData?.wholesale_price != null ? String(deviceData?.wholesale_price) : "",
    inventory: deviceData?.inventory != null ? String(deviceData?.inventory) : "",
    notes: deviceData?.notes || "",
  };
};

export const MyDeviceForm: React.FC<MyDeviceFormProps> = ({
  formData: propFormData,
  onChange,
  onCancel,
  onSuccess,
  editMode = false,
  deviceId,
  initialData,
}) => {
  const [localFormData, setLocalFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Options
  const [deviceOptions, setDeviceOptions] = useState<DeviceOption[]>([]);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>([]);

  // Nếu parent truyền formData → ưu tiên dùng; ngược lại dùng local
  const currentFormData = propFormData || localFormData;

  // ============ LOAD CÁC OPTION CƠ BẢN ============ //
  useEffect(() => {
    const fetchBaseOptions = async () => {
      try {
        // Danh sách dòng máy
        const devicesResp = await deviceService.getAllDevices();
        const devices = Array.isArray(devicesResp) ? devicesResp : (devicesResp ?? []);
        setDeviceOptions(devices || []);
      } catch (e) {
        console.error("Lỗi khi tải danh sách thiết bị:", e);
        setDeviceOptions([]);
      }
    };
    fetchBaseOptions();
  }, []);

  // ============ KHI VÀO EDIT MODE: LOAD DỮ LIỆU HIỆN HỮU ============ //
  useEffect(() => {
    let mounted = true;

    const doLoad = async () => {
      if (!editMode) {
        setLocalFormData(INITIAL_FORM);
        return;
      }
      if (initialData) {
        const form = formatDeviceForForm(initialData);
        if (mounted) setLocalFormData(form);
        return;
      }
      if (deviceId) {
        try {
          setFormLoading(true);
          const resp = await userDeviceService.getUserDeviceById(deviceId);
          const form = formatDeviceForForm(resp);
          if (mounted) setLocalFormData(form);
        } catch (e) {
          alert("Không thể tải thông tin thiết bị!");
        } finally {
          setFormLoading(false);
        }
      }
    };

    doLoad();
    return () => {
      mounted = false;
    };
  }, [editMode, deviceId, initialData]);

  useEffect(() => {
    let mounted = true;

    const deviceInfoId = currentFormData.device_info_id;
    if (!deviceInfoId) {
      setColorOptions([]);
      setStorageOptions([]);
      return;
    }

    const fetchDependentOptions = async () => {
      try {
        const [colorsResp, storagesResp] = await Promise.all([
          colorService.getColorsByDeviceId(deviceInfoId),
          deviceStorageService.getDeviceStoragesByDevice(deviceInfoId),
        ]);

        const colors = Array.isArray(colorsResp) ? colorsResp : (colorsResp || colorsResp || []);
        const storages = Array.isArray(storagesResp) ? storagesResp : (storagesResp?? []);

        if (!mounted) return;
        setColorOptions(colors || []);
        setStorageOptions(storages || []);

        // Nếu color_id/storage_id hiện tại không còn hợp lệ → reset
        const colorStillValid = colors?.some(c => (c?.id ?? "") === currentFormData.color_id);
        const storageStillValid = storages?.some((s: { id: any; storage_id: any; }) => (s?.id ?? s?.storage_id ?? "") === currentFormData.storage_id);

        if (!colorStillValid || !storageStillValid) {
          const patched = {
            ...currentFormData,
            color_id: colorStillValid ? currentFormData.color_id : "",
            storage_id: storageStillValid ? currentFormData.storage_id : "",
          };
          if (propFormData) {
            // để parent nhận change
            const fakeEvent = {
              target: { name: "color_id", value: patched.color_id },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(fakeEvent);
            const fakeEvent2 = {
              target: { name: "storage_id", value: patched.storage_id },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(fakeEvent2);
          } else {
            setLocalFormData(patched);
          }
        }
      } catch (e) {
        console.error("Lỗi lấy màu/dung lượng theo thiết bị:", e);
        if (!mounted) return;
        setColorOptions([]);
        setStorageOptions([]);
      }
    };

    fetchDependentOptions();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormData.device_info_id]);

  // ============ HANDLERS ============ //
  const handleLocalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Xử lý logic khi chọn loại thiết bị
    if (name === "device_type") {
      if (value.toLowerCase() === "mới") {
        const patched = {
          ...currentFormData,
          device_type: value,
          device_condition: "",
          battery_condition: "100", // hiển thị 100; khi submit sẽ chuyển thành number
        };
        if (onChange) {
          // báo lên parent 2 field để sync
          onChange({ target: { name: "device_type", value } } as any);
          onChange({ target: { name: "device_condition", value: "" } } as any);
          onChange({ target: { name: "battery_condition", value: "100" } } as any);
        } else {
          setLocalFormData(patched);
        }
        return;
      }

      if (value.toLowerCase() === "cũ") {
        const patched = {
          ...currentFormData,
          device_type: value,
          device_condition: "",
          battery_condition: "",
        };
        if (onChange) {
          onChange({ target: { name: "device_type", value } } as any);
          onChange({ target: { name: "device_condition", value: "" } } as any);
          onChange({ target: { name: "battery_condition", value: "" } } as any);
        } else {
          setLocalFormData(patched);
        }
        return;
      }
    }

    // Khi đổi device_info_id → reset color/storage (sẽ nạp lại qua effect)
    if (name === "device_info_id") {
      if (onChange) {
        onChange(e);
        onChange({ target: { name: "color_id", value: "" } } as any);
        onChange({ target: { name: "storage_id", value: "" } } as any);
      } else {
        setLocalFormData((prev) => ({
          ...prev,
          device_info_id: value,
          color_id: "",
          storage_id: "",
        }));
      }
      return;
    }

    // Default
    if (onChange) onChange(e);
    else setLocalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const isNew = (currentFormData.device_type || "").trim().toLowerCase() === "mới";

    const device_condition = isNew ? "" : String(currentFormData.device_condition ?? "").trim();
    const battery_condition = isNew
      ? "100"
      : String(String(currentFormData.battery_condition ?? "").replace(/[^\d]/g, "")).trim();

    const storageId = currentFormData.storage_id || null;

    const payload: any = {
      device_info_id: currentFormData.device_info_id || null,
      color_id: currentFormData.color_id || null,
      // GỬI CẢ HAI TRƯỜNG
      storage_id: storageId,
      device_storage_id: storageId,

      device_type: currentFormData.device_type || null,
      warranty: currentFormData.warranty || null,
      device_condition,      // string
      battery_condition,     // string (BE đang yêu cầu string)
      price: toNumberOrNull(currentFormData.price),
      wholesale_price: toNumberOrNull(currentFormData.wholesale_price),
      inventory: toNumberOrNull(currentFormData.inventory),
      notes: currentFormData.notes || null,
    };
    return payload;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload();

      if (!payload.device_info_id) {
        alert("Vui lòng chọn dòng máy!");
        setLoading(false);
        return;
      }
      if (!payload.color_id) {
        alert("Vui lòng chọn màu hợp lệ của thiết bị!");
        setLoading(false);
        return;
      }
      if (!payload.storage_id) {
        alert("Vui lòng chọn dung lượng hợp lệ của thiết bị!");
        setLoading(false);
        return;
      }

      if (editMode && deviceId) {
        await userDeviceService.updateUserDevice(deviceId, payload);
        alert("✅ Cập nhật thiết bị thành công!");
      } else {
        await userDeviceService.addUserDevice(payload);
        alert("✅ Thêm thiết bị thành công!");
      }

      onSuccess ? onSuccess() : setLocalFormData(INITIAL_FORM);
    } catch (error: any) {
      // Bắn lại thông điệp BE (nếu có)
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "❌ Có lỗi xảy ra khi lưu thiết bị. Vui lòng thử lại!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasFormData = useMemo(() => {
    const formValues = Object.values(currentFormData);
    const initialValues = Object.values(INITIAL_FORM);
    return formValues.some((v, idx) => v !== "" && v !== initialValues[idx]);
  }, [currentFormData]);

  const handleCancel = () => {
    if (hasFormData) {
      if (window.confirm("Bạn có chắc muốn hủy? Dữ liệu nhập sẽ bị mất.")) {
        if (onCancel) onCancel();
        else setLocalFormData(INITIAL_FORM);
      }
    } else {
      if (onCancel) onCancel();
      else setLocalFormData(INITIAL_FORM);
    }
  };

  // ============ RENDER ============ //
  if (formLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md relative">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {editMode ? "✏️ Cập nhật thiết bị" : "🧾 Thêm thiết bị mới"}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Đóng"
          aria-label="Đóng"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Dòng máy */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Dòng máy:</label>
          <select
            name="device_info_id"
            value={currentFormData.device_info_id}
            onChange={handleLocalChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
            required
            disabled={loading}
          >
            <option key="dev-empty" value="">-- Chọn thiết bị --</option>
            {deviceOptions.map((d, idx) => (
              <option key={`dev-${d?.id ?? idx}`} value={d?.id ?? ""}>
                {d?.model ?? "(Không tên)"}
              </option>
            ))}
          </select>
        </div>

        {/* Màu sắc + Dung lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Màu sắc:</label>
            <select
              name="color_id"
              value={currentFormData.color_id}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              required
              disabled={loading || !currentFormData.device_info_id}
            >
              <option key="color-empty" value="">-- Chọn màu --</option>
              {colorOptions.map((c, idx) => (
                <option key={`color-${c?.id ?? idx}`} value={c?.id ?? ""}>
                  {c?.name ?? "(Không tên)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Dung lượng:</label>
            <select
              name="storage_id"
              value={currentFormData.storage_id}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              required
              disabled={loading || !currentFormData.device_info_id}
            >
              <option key="storage-empty" value="">-- Chọn dung lượng --</option>
              {storageOptions.map((s: any, idx: number) => {
                const val = String(s?.id ?? s?.storage_id ?? s?.device_storage_id ?? "");
                const cap = s?.capacity ?? s?.capacity_gb ?? s?.size;
                return (
                  <option key={`stg-${val || idx}`} value={val}>
                    {cap != null ? `${cap} GB` : "(Không rõ)"}
                  </option>
                );
              })}

            </select>

          </div>
        </div>

        {/* Loại thiết bị + Bảo hành */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Loại thiết bị:</label>
            <select
              name="device_type"
              value={currentFormData.device_type}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              required
              disabled={loading}
            >
              <option key="type-empty" value="">-- Chọn loại --</option>
              <option key="type-new" value="mới">Mới</option>
              <option key="type-old" value="cũ">Cũ</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Bảo hành:</label>
            <input
              name="warranty"
              placeholder="VD: 12 tháng"
              value={currentFormData.warranty}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* Khi chọn Cũ */}
        {currentFormData.device_type?.toLowerCase() === "cũ" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Tình trạng máy:</label>
              <input
                name="device_condition"
                placeholder="VD: 98%, trầy nhẹ"
                value={currentFormData.device_condition}
                onChange={handleLocalChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">Tình trạng pin:</label>
              <input
                name="battery_condition"
                placeholder="VD: 90%"
                value={currentFormData.battery_condition}
                onChange={handleLocalChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Giá bán / Giá sỉ / Tồn kho */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Giá bán:</label>
            <input
              type="number"
              name="price"
              placeholder="Giá bán"
              value={currentFormData.price}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Giá sỉ:</label>
            <input
              type="number"
              name="wholesale_price"
              placeholder="Giá sỉ"
              value={currentFormData.wholesale_price}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Tồn kho:</label>
            <input
              type="number"
              name="inventory"
              placeholder="Tồn kho"
              value={currentFormData.inventory}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Ghi chú:</label>
          <textarea
            name="notes"
            placeholder="Ghi chú thêm..."
            value={currentFormData.notes}
            onChange={handleLocalChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200 resize-vertical"
            disabled={loading}
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? "Đang lưu..." : editMode ? "Cập nhật" : "Thêm thiết bị"}
          </button>
        </div>
      </form>
    </div>
  );
};
