// MyDeviceForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { userDeviceService } from "../../../../services/userDeviceService";
import { deviceService } from "../../../../services/deviceService";
import { colorService } from "../../../../services/colorService";
import { deviceStorageService } from "../../../../services/deviceStorageService";
import { UserDevice } from "../../../../types/device";

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
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
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

const formatDeviceForForm = (device: any) => {
  // Một số API trả về trong field data
  const deviceData = device?.data || device;
  console.log("deviceData", deviceData);
  return {
    device_info_id:
      deviceData?.device_info?.id ?? deviceData?.device_info_id ?? "",

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
        : deviceData?.battery_condition || "",
    price: deviceData?.price != null ? String(deviceData?.price) : "",
    wholesale_price:
      deviceData?.wholesale_price != null
        ? String(deviceData?.wholesale_price)
        : "",
    inventory:
      deviceData?.inventory != null ? String(deviceData?.inventory) : "",
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
        const devices = Array.isArray(devicesResp)
          ? devicesResp
          : devicesResp ?? [];
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
          console.log("EDIT FORM device_info_id =", form.device_info_id);
      console.log("deviceOptions ids =", deviceOptions.map(d => d.id));
          if (mounted) setLocalFormData(form);
        } catch {
          await Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể tải thông tin thiết bị!",
            confirmButtonText: "Đóng",
          });
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

        const colors = Array.isArray(colorsResp)
          ? colorsResp
          : colorsResp || colorsResp || [];
        const storages = Array.isArray(storagesResp)
          ? storagesResp
          : storagesResp ?? [];

        if (!mounted) return;
        setColorOptions(colors || []);
        setStorageOptions(storages || []);

        // Tự động chọn màu sắc và dung lượng đầu tiên khi chọn dòng máy
        const firstColorId =
          colors && colors.length > 0 ? colors[0]?.id ?? "" : "";
        const firstStorageId =
          storages && storages.length > 0
            ? String(
                storages[0]?.id ??
                  storages[0]?.storage_id ??
                  storages[0]?.device_storage_id ??
                  ""
              )
            : "";

        // Kiểm tra giá trị hiện tại có hợp lệ không
        const colorStillValid = colors?.some(
          (c) => (c?.id ?? "") === currentFormData.color_id
        );
        const storageStillValid = storages?.some((s: any) => {
          const currentStorageId = String(currentFormData.storage_id ?? "");
          return (
            (s?.id ?? s?.storage_id ?? s?.device_storage_id ?? "") ===
            currentStorageId
          );
        });

        // Tự động chọn option đầu tiên nếu:
        // 1. Chưa có giá trị được chọn (rỗng)
        // 2. Hoặc giá trị hiện tại không hợp lệ với dòng máy mới
        const shouldAutoSelectColor =
          !currentFormData.color_id || !colorStillValid;
        const shouldAutoSelectStorage =
          !currentFormData.storage_id || !storageStillValid;

        const newColorId =
          shouldAutoSelectColor && firstColorId
            ? firstColorId
            : colorStillValid
            ? currentFormData.color_id
            : "";
        const newStorageId =
          shouldAutoSelectStorage && firstStorageId
            ? firstStorageId
            : storageStillValid
            ? currentFormData.storage_id
            : "";

        // Chỉ cập nhật nếu có thay đổi
        if (
          newColorId !== currentFormData.color_id ||
          newStorageId !== currentFormData.storage_id
        ) {
          const patched = {
            ...currentFormData,
            color_id: newColorId,
            storage_id: newStorageId,
          };
          if (propFormData) {
            // để parent nhận change
            if (newColorId !== currentFormData.color_id) {
              const fakeEvent = {
                target: { name: "color_id", value: newColorId },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange?.(fakeEvent);
            }
            if (newStorageId !== currentFormData.storage_id) {
              const fakeEvent2 = {
                target: { name: "storage_id", value: newStorageId },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange?.(fakeEvent2);
            }
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
          onChange({
            target: { name: "battery_condition", value: "100" },
          } as any);
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
    const isNew =
      (currentFormData.device_type || "").trim().toLowerCase() === "mới";

    const device_condition = isNew
      ? ""
      : String(currentFormData.device_condition ?? "").trim();
    const battery_condition = isNew
      ? "100"
      : String(
          String(currentFormData.battery_condition ?? "").replace(/[^\d]/g, "")
        ).trim();

    const storageId = currentFormData.storage_id || null;

    const payload: any = {
      device_info_id: currentFormData.device_info_id || null,
      color_id: currentFormData.color_id || null,
      // GỬI CẢ HAI TRƯỜNG
      storage_id: storageId,
      device_storage_id: storageId,

      device_type: currentFormData.device_type || null,
      warranty: currentFormData.warranty || null,
      device_condition, // string
      battery_condition, // string (BE đang yêu cầu string)
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
        await Swal.fire({
          icon: "warning",
          title: "Thiếu thông tin",
          text: "Vui lòng chọn dòng máy!",
          confirmButtonText: "Đóng",
        });
        setLoading(false);
        return;
      }
      if (!payload.color_id) {
        await Swal.fire({
          icon: "warning",
          title: "Thiếu thông tin",
          text: "Vui lòng chọn màu hợp lệ của thiết bị!",
          confirmButtonText: "Đóng",
        });
        setLoading(false);
        return;
      }
      if (!payload.storage_id) {
        await Swal.fire({
          icon: "warning",
          title: "Thiếu thông tin",
          text: "Vui lòng chọn dung lượng hợp lệ của thiết bị!",
          confirmButtonText: "Đóng",
        });
        setLoading(false);
        return;
      }

      if (editMode && deviceId) {
        await userDeviceService.updateUserDevice(deviceId, payload);
        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Cập nhật thiết bị thành công!",
          confirmButtonText: "Đóng",
          timer: 2000,
        });
      } else {
        await userDeviceService.addUserDevice(payload);
        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Thêm thiết bị thành công!",
          confirmButtonText: "Đóng",
          timer: 2000,
        });
      }

      // Gọi onSuccess để đóng modal và refresh data
      if (onSuccess) {
        onSuccess();
      } else {
        setLocalFormData(INITIAL_FORM);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi lưu thiết bị. Vui lòng thử lại!";
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: msg,
        confirmButtonText: "Đóng",
      });
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
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full max-h-[90vh]">
      {/* Header - Fixed */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {editMode ? (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {editMode ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
          </h2>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all duration-200"
          title="Đóng"
          aria-label="Đóng"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Form Content - Scrollable */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {/* Dòng máy */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Dòng máy <span className="text-red-500">*</span>
          </label>
          <select
            name="device_info_id"
            value={currentFormData.device_info_id}
            onChange={handleLocalChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            required
            disabled={loading}
          >
            <option key="dev-empty" value="">
              -- Chọn thiết bị --
            </option>
            {deviceOptions.map((d, idx) => (
              <option key={`dev-${d?.id ?? idx}`} value={d?.id ?? ""}>
                {d?.model ?? "(Không tên)"}
              </option>
            ))}
          </select>
        </div>

        {/* Màu sắc + Dung lượng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Màu sắc <span className="text-red-500">*</span>
            </label>
            <select
              name="color_id"
              value={currentFormData.color_id}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
              disabled={loading || !currentFormData.device_info_id}
            >
              <option key="color-empty" value="">
                -- Chọn màu --
              </option>
              {colorOptions.map((c, idx) => (
                <option key={`color-${c?.id ?? idx}`} value={c?.id ?? ""}>
                  {c?.name ?? "(Không tên)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Dung lượng <span className="text-red-500">*</span>
            </label>
            <select
              name="storage_id"
              value={currentFormData.storage_id}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
              disabled={loading || !currentFormData.device_info_id}
            >
              <option key="storage-empty" value="">
                -- Chọn dung lượng --
              </option>
              {storageOptions.map((s: any, idx: number) => {
                const val = String(
                  s?.id ?? s?.storage_id ?? s?.device_storage_id ?? ""
                );
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Loại thiết bị <span className="text-red-500">*</span>
            </label>
            <select
              name="device_type"
              value={currentFormData.device_type}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
              disabled={loading}
            >
              <option key="type-empty" value="">
                -- Chọn loại --
              </option>
              <option key="type-new" value="mới">
                Mới
              </option>
              <option key="type-old" value="cũ">
                Cũ
              </option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Bảo hành
            </label>
            <input
              name="warranty"
              placeholder="VD: 12 tháng"
              value={currentFormData.warranty}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
        </div>

        {/* Khi chọn Cũ */}
        {currentFormData.device_type?.toLowerCase() === "cũ" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Tình trạng máy
              </label>
              <input
                name="device_condition"
                placeholder="VD: 98%, trầy nhẹ"
                value={currentFormData.device_condition}
                onChange={handleLocalChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Tình trạng pin
              </label>
              <input
                name="battery_condition"
                placeholder="VD: 90%"
                value={currentFormData.battery_condition}
                onChange={handleLocalChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Giá bán / Giá sỉ / Tồn kho */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Giá bán
            </label>
            <input
              type="number"
              name="price"
              placeholder="0"
              value={currentFormData.price}
              onChange={handleLocalChange}
              min="0"
              step="1000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Giá sỉ
            </label>
            <input
              type="number"
              name="wholesale_price"
              placeholder="0"
              value={currentFormData.wholesale_price}
              onChange={handleLocalChange}
              min="0"
              step="1000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Tồn kho
            </label>
            <input
              type="number"
              name="inventory"
              placeholder="0"
              value={currentFormData.inventory}
              onChange={handleLocalChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Ghi chú
          </label>
          <textarea
            name="notes"
            placeholder="Ghi chú thêm..."
            value={currentFormData.notes}
            onChange={handleLocalChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-vertical disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                {editMode ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Cập nhật</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Thêm thiết bị</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
