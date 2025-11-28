// src/components/SettingsManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Plus, Edit, Trash2, Save, MessageCircle, X, FileUp, FileDown, RefreshCw
} from 'lucide-react';
import { faqMobileService, FaqItem, FaqCreate } from '../services/faqMobileService';
import { getStoreInfo as getStoreInfoApi, saveStoreInfo as saveStoreInfoApi } from '../services/documentService';

type TabKey = 'faq' | 'store-info' | 'bot-control';

interface FAQRow {
  id: string;            // map từ faq_id
  category: string;      // map từ classification
  question: string;
  answer: string;
  images: string[];      // tách từ image (CSV) nếu backend trả chuỗi
}

interface StoreInfo {
  name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  facebook: string;
  image: string;
  map: string;
  additional: string;
}

interface BotSettings {
  zalo: boolean;
  zaloOA: boolean;
  messenger: boolean;
}

const mapApiToRow = (it: FaqItem): FAQRow => ({
  id: it.faq_id,
  category: it.classification,
  question: it.question,
  answer: it.answer,
  images: it.image ? it.image.split(',').map(s => s.trim()).filter(Boolean) : [],
});

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
};

const SettingsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('faq');

  // ===== FAQ states =====
  const [faqs, setFaqs] = useState<FAQRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showFAQForm, setShowFAQForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [faqCategory, setFaqCategory] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // ===== Store & Bot (giữ local như cũ) =====
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Cửa Hàng Điện Thoại ABC',
    phone: '0987654321',
    email: 'contact@cuahangdienthoai.com',
    website: 'https://cuahangdienthoai.com',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    facebook: 'https://facebook.com/cuahangdienthoai',
    image: 'https://example.com/store-image.jpg',
    map: 'https://maps.google.com/?q=123+Nguyễn+Văn+Linh',
    additional: 'Cửa hàng chuyên sửa chữa điện thoại, thay linh kiện chính hãng với giá tốt nhất thị trường.'
  });

  const [botSettings, setBotSettings] = useState<BotSettings>({
    zalo: true,
    zaloOA: true,
    messenger: true
  });
  const [storeImageUrl, setStoreImageUrl] = useState(storeInfo.image);
  const [storeImageFileName, setStoreImageFileName] = useState('');
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);

  // ===== Helpers =====
  const resetForm = () => {
    setEditingId(null);
    setFaqCategory('');
    setFaqQuestion('');
    setFaqAnswer('');
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const openCreate = () => {
    resetForm();
    setShowFAQForm(true);
  };

  const openEdit = (row: FAQRow) => {
    setEditingId(row.id);
    setFaqCategory(row.category);
    setFaqQuestion(row.question);
    setFaqAnswer(row.answer);
    // ảnh đang có là URL — để đơn giản giữ nguyên; khi người dùng chọn files mới sẽ upload thay thế/đính kèm (tùy backend xử lý)
    setSelectedFiles([]);
    setFilePreviews(row.images);
    setShowFAQForm(true);
  };

  // ===== Store Info load from API =====
  useEffect(() => {
    const loadStoreInfoFromApi = async () => {
      try {
        const apiData = await getStoreInfoApi();
        const mapped: StoreInfo = {
          name: apiData.store_name || '',
          address: apiData.store_address || '',
          phone: apiData.store_phone || '',
          email: apiData.store_email || '',
          website: apiData.store_website || '',
          facebook: apiData.store_facebook || '',
          image: apiData.store_image || '',
          map: apiData.store_address_map || '',
          additional: apiData.info_more || '',
        };
        setStoreInfo(mapped);
        setStoreImageUrl(mapped.image);
        setStoreImageFileName('');
      } catch (err: unknown) {
        console.error('Không thể tải thông tin cửa hàng:', err);
      }
    };

    loadStoreInfoFromApi();
  }, []);

  // ===== API actions =====
  const loadFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await faqMobileService.getAllFaqs();
      setFaqs(data.map(mapApiToRow));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách FAQ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const onSaveFAQ = async () => {
    if (!faqCategory.trim() || !faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Vui lòng nhập đủ Phân loại, Câu hỏi và Câu trả lời');
      return;
    }

    const payload: FaqCreate = {
      classification: faqCategory.trim(),
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      images: selectedFiles.length ? selectedFiles : undefined,
    };

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await faqMobileService.updateFaq(editingId, payload);
        alert('Cập nhật FAQ thành công!');
      } else {
        await faqMobileService.addFaq(payload);
        alert('Thêm FAQ thành công!');
      }
      setShowFAQForm(false);
      resetForm();
      await loadFaqs();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được FAQ'));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteFAQ = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa FAQ này?')) return;
    setSaving(true);
    setError(null);
    try {
      await faqMobileService.deleteFaq(id);
      await loadFaqs();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được FAQ'));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAll = async () => {
    if (!confirm('XÓA TẤT CẢ FAQ? Hành động này không thể hoàn tác.')) return;
    setSaving(true);
    setError(null);
    try {
      await faqMobileService.deleteAllFaqs();
      await loadFaqs();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được tất cả FAQ'));
    } finally {
      setSaving(false);
    }
  };

  const onImportExcel = async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      await faqMobileService.importFaqFromFile(file);
      alert('Import thành công!');
      await loadFaqs();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Import thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const onExportExcel = async () => {
    setSaving(true);
    setError(null);
    try {
      const blob = await faqMobileService.exportFaqToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'faqs.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Export thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const onPickFiles = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(ev.target.files || []);
    setSelectedFiles(files);
    setFilePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleStoreInfoChange = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleStoreImageUrlChange = (value: string) => {
    setStoreImageUrl(value);
    setStoreImageFileName('');
    handleStoreInfoChange('image', value);
  };

  const handleStoreImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh tối đa 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setStoreImageFileName(file.name);
      setStoreImageUrl('');
      handleStoreInfoChange('image', base64);
    };
    reader.onerror = () => {
      alert('Không đọc được tệp ảnh, vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreInfo = async () => {
    const payload = {
      store_name: storeInfo.name.trim(),
      store_address: storeInfo.address.trim(),
      store_phone: storeInfo.phone.trim(),
      store_email: storeInfo.email.trim(),
      store_website: storeInfo.website.trim(),
      store_facebook: storeInfo.facebook.trim(),
      store_address_map: storeInfo.map.trim(),
      store_image: storeInfo.image.trim(),
      info_more: storeInfo.additional.trim(),
    };
    setSavingStoreInfo(true);
    try {
      await saveStoreInfoApi(payload);
      alert('Thông tin cửa hàng đã được lưu!');
      setStoreImageFileName('');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể lưu thông tin cửa hàng, vui lòng thử lại.'));
    } finally {
      setSavingStoreInfo(false);
    }
  };

  const handleBotSettingChange = (platform: keyof BotSettings, value: boolean) => {
    setBotSettings(prev => ({ ...prev, [platform]: value }));
  };

  const handleSaveBotSettings = () => {
    // TODO: Nếu có API riêng, gọi ở đây
    console.log('Lưu BotSettings:', botSettings);
    alert('Cài đặt bot đã được lưu!');
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'faq' as const, label: 'Quản lý câu hỏi thường gặp' },
          { key: 'store-info' as const, label: 'Thông Tin Cửa Hàng' },
          { key: 'bot-control' as const, label: 'Bật/Tắt Bot' },
        ].map(t => (
          <button
            key={t.key}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== FAQ Tab ===== */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Quản lý câu hỏi thường gặp (API)</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadFaqs()}
                className="flex items-center gap-2 bg-white border text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Tải lại
              </button>
              <label className="flex items-center gap-2 bg-white border text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <FileUp size={16} />
                Import Excel
                <input type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportExcel(f);
                    e.currentTarget.value = '';
                  }} />
              </label>
              <button
                onClick={onExportExcel}
                className="flex items-center gap-2 bg-white border text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                <FileDown size={16} />
                Export Excel
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={16} />
                Thêm FAQ
              </button>
              {faqs.length > 0 && (
                <button
                  onClick={onDeleteAll}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg border border-red-200"
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* FAQ Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-600">Đang tải dữ liệu…</div>
          ) : faqs.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Phân loại</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Câu hỏi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Câu trả lời</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Hình ảnh</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{faq.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{faq.question}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                        {faq.answer.length > 80 ? `${faq.answer.substring(0, 80)}…` : faq.answer}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {faq.images.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {faq.images.slice(0, 3).map((url, i) => (
                              <img key={i} src={url} alt="" className="w-10 h-10 rounded object-cover border" />
                            ))}
                            {faq.images.length > 3 && (
                              <span className="text-xs text-gray-500">+{faq.images.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">Không</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(faq)}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                          >
                            <Edit size={14} />
                            Sửa
                          </button>
                          <button
                            onClick={() => onDeleteFAQ(faq.id)}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            disabled={saving}
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Chưa có FAQ nào</p>
              <p className="text-gray-500 text-sm">Sử dụng nút “Thêm FAQ” để tạo mới</p>
            </div>
          )}

          {/* FAQ Form */}
          {showFAQForm && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingId ? 'Chỉnh sửa FAQ' : 'Thêm FAQ'}
                </h3>
                <button
                  onClick={() => { setShowFAQForm(false); resetForm(); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phân loại</label>
                  <input
                    type="text"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Dịch vụ, Giá cả…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Câu hỏi</label>
                  <input
                    type="text"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập câu hỏi"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Câu trả lời</label>
                  <textarea
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="Nhập câu trả lời"
                  />
                </div>

                {/* Upload nhiều ảnh */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa (nhiều ảnh)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onPickFiles}
                    className="block w-full text-sm text-gray-700
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {filePreviews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {filePreviews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-16 rounded object-cover border" />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Ảnh chọn ở đây sẽ được upload qua field <code>files</code> (FormData) theo API.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowFAQForm(false); resetForm(); }}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={onSaveFAQ}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  <Save size={16} />
                  {editingId ? 'Cập nhật FAQ' : 'Lưu FAQ'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Store Info Tab ===== */}
      {activeTab === 'store-info' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thông Tin Cửa Hàng</h2>
              <p className="text-gray-600">Cấu hình thông tin cửa hàng cho chatbot tư vấn</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông Tin Cơ Bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Cửa Hàng</label>
                  <input
                    type="text"
                    value={storeInfo.name}
                    onChange={(e) => handleStoreInfoChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={storeInfo.phone}
                    onChange={(e) => handleStoreInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => handleStoreInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={storeInfo.website}
                    onChange={(e) => handleStoreInfoChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
                  <textarea
                    value={storeInfo.address}
                    onChange={(e) => handleStoreInfoChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mạng Xã Hội & Thông Tin Bổ Sung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="text"
                    value={storeInfo.facebook}
                    onChange={(e) => handleStoreInfoChange('facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình Ảnh Cửa Hàng (URL)</label>
                  <input
                    type="text"
                    value={storeImageUrl}
                    onChange={(e) => handleStoreImageUrlChange(e.target.value)}
                    placeholder="Dán URL ảnh cửa hàng"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs font-medium text-gray-600">Upload Ảnh Cửa Hàng</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStoreImageUpload}
                      className="block w-full text-sm text-gray-700
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {storeImageFileName && (
                      <p className="text-xs text-gray-500">Đã chọn: {storeImageFileName}</p>
                    )}
                    {storeInfo.image && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Xem trước</p>
                        <img
                          src={storeInfo.image}
                          alt="store"
                          className="w-full max-h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ Bản Đồ</label>
                  <input
                    type="text"
                    value={storeInfo.map}
                    onChange={(e) => handleStoreInfoChange('map', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thông Tin Thêm</label>
                  <textarea
                    value={storeInfo.additional}
                    onChange={(e) => handleStoreInfoChange('additional', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={handleSaveStoreInfo}
                disabled={savingStoreInfo}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Lưu Thông Tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Bot Control Tab ===== */}
      {activeTab === 'bot-control' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Bật/Tắt Bot</h2>
            <p className="text-gray-600">Theo dõi trạng thái và điều khiển hoạt động bot</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bật/Tắt theo nền tảng</h3>
            <div className="space-y-4">
              {[
                { key: 'zalo' as const, label: 'Zalo (ZCA)', description: 'Điều khiển bật/tắt tự động cho nền tảng này' },
                { key: 'zaloOA' as const, label: 'Zalo OA', description: 'Điều khiển bật/tắt tự động cho nền tảng này' },
                { key: 'messenger' as const, label: 'Messenger', description: 'Điều khiển bật/tắt tự động cho nền tảng này' }
              ].map(platform => (
                <div key={platform.key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-800">{platform.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{platform.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={botSettings[platform.key]}
                      onChange={(e) => handleBotSettingChange(platform.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái & Điều khiển</h3>
            <div className="space-y-4">
              {[
                { label: 'Chatbot Mobile', description: 'Nguồn: Backend proxy → https://chatbotmobile.quandoiai.vn', status: 'active' },
                { label: 'Chatbot Custom', description: 'Nguồn: Backend proxy → https://chatbotproduct.quandoiai.vn', status: 'active' }
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-800">{service.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={handleSaveBotSettings}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                <Save size={16} />
                Lưu Cài Đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;
