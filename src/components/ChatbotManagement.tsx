import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  Plus,
  RefreshCw,
  FileText,
  Upload,
  Link,
  Globe,
  Smartphone,
  Wrench,
  Cpu,
  Loader2
} from 'lucide-react';
import { getChatbotSettings, ChatbotSettings } from '../services/chatbotJSService'; 
import { getMyBotConfig } from '../services/botConfigService'; 
import { listDocuments, uploadFileDocument, uploadTextDocument, uploadUrlDocument, uploadWebsite } from '../services/documentService';
import { getSystemPrompt } from '../services/componentService';
import { 
  updateAccessoryFeatureConfig, 
  updatePersonaConfig, 
  updatePromptConfig, 
  updateServiceFeatureConfig,
  getPersonaConfig,
  getPromptConfig,
  getServiceFeatureConfig,
  getAccessoryFeatureConfig
} from '../services/userConfigService';

// Interface cho state của form (đã có trong code của bạn)
interface CombinedSettings extends ChatbotSettings {
  chatbot_role: string;
  custom_prompt: string;
  enable_service_consulting: boolean;
  enable_accessory_consulting: boolean;
  stop_minutes: number;
  persona_tone?: string;
  prompt_language?: string;
}

// Interface cho tài liệu (đã có trong code của bạn)
interface Document {
  id: string;
  name: string;
  type: string;
}

// --- Component ---

type Order = Record<string, unknown>;
type TabId = 'documents' | 'orders' | 'settings';
type OrderTypeId = 'phone' | 'service' | 'component';

const ChatbotManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('documents');
  const [selectedOrderType, setSelectedOrderType] = useState<OrderTypeId>('phone');
  
  // State cho dữ liệu
  const [documents, setDocuments] = useState<Document[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Partial<CombinedSettings>>({
    chatbot_name: '',
    chatbot_role: '',
    custom_prompt: '',
    enable_service_consulting: true,
    enable_accessory_consulting: true,
    persona_tone: '',
    prompt_language: 'vi',
    stop_minutes: 0,
  });
  
  // State quản lý tải dữ liệu
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  // State cho upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Định nghĩa Tabs và Order Types (như cũ) ---
  const tabs: { id: TabId; label: string }[] = [
    { id: 'documents', label: 'Quản lý Tài liệu' },
    { id: 'orders', label: 'Quản lý Đơn hàng' },
    { id: 'settings', label: 'Cài đặt Hệ thống' },
  ];

  const orderTypes: { id: OrderTypeId; name: string; count: number; description: string; icon: React.ReactNode }[] = [
    { id: 'phone', name: 'Đơn Hàng Điện Thoại', count: 0, description: 'Quản lý các đơn hàng điện thoại', icon: <Smartphone size={24} /> },
    { id: 'service', name: 'Đơn Hàng Dịch Vụ', count: 0, description: 'Quản lý các đơn hàng dịch vụ sửa chữa', icon: <Wrench size={24} /> },
    { id: 'component', name: 'Đơn Hàng Linh Kiện', count: 0, description: 'Quản lý các đơn hàng linh kiện', icon: <Cpu size={24} /> },
  ];
  

  // Hàm tải cài đặt (từ nhiều nguồn)
  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      // Tải song song tất cả các cấu hình
      const results = await Promise.allSettled([
        getChatbotSettings(),
        getMyBotConfig(), // Mặc định lấy "me"
        getSystemPrompt(), // Lấy prompt của bot linh kiện
        getPersonaConfig(), // Lấy persona config từ user-config
        getPromptConfig(), // Lấy prompt config từ user-config
        getServiceFeatureConfig(), // Lấy service feature config
        getAccessoryFeatureConfig(), // Lấy accessory feature config
      ]);

      const [
        settingsResult,
        botConfigResult,
        promptResult,
        personaResult,
        userPromptResult,
        serviceFeatureResult,
        accessoryFeatureResult,
      ] = results;

      // Xử lý kết quả từ chatbot-js-agent
      const settingsData = settingsResult.status === 'fulfilled' ? settingsResult.value : {};
      
      // Xử lý kết quả từ bot-config
      const botConfigData = botConfigResult.status === 'fulfilled' ? botConfigResult.value : null;
      
      // Xử lý kết quả từ system-prompt (bot linh kiện)
      const promptData = promptResult.status === 'fulfilled' ? promptResult.value : { prompt_content: '' };
      
      // Xử lý kết quả từ persona config
      const personaData = personaResult.status === 'fulfilled' && personaResult.value ? personaResult.value : null;
      
      // Xử lý kết quả từ user prompt config
      const userPromptData = userPromptResult.status === 'fulfilled' && userPromptResult.value ? userPromptResult.value : null;
      
      // Xử lý kết quả từ service feature
      const serviceFeatureData = serviceFeatureResult.status === 'fulfilled' && serviceFeatureResult.value ? serviceFeatureResult.value : null;
      
      // Xử lý kết quả từ accessory feature
      const accessoryFeatureData = accessoryFeatureResult.status === 'fulfilled' && accessoryFeatureResult.value ? accessoryFeatureResult.value : null;

      // Gộp tất cả dữ liệu vào settings
      setSettings(prev => ({
        ...prev,
        ...settingsData,
        // Từ chatbot-js-agent (nếu có)
        chatbot_name: personaData?.ai_name || settingsData.chatbot_name || prev.chatbot_name || '',
        chatbot_role: personaData?.ai_role || settingsData.chatbot_role || prev.chatbot_role || '',
        // Từ persona config - tone
        persona_tone: personaData?.tone || prev.persona_tone || '',
        // Từ bot-config
        stop_minutes: (botConfigData && 'data' in botConfigData && botConfigData.data?.stop_minutes) || prev.stop_minutes || 0,
        // Từ system-prompt (bot linh kiện) - ưu tiên user-config nếu có
        custom_prompt: userPromptData?.custom_prompt || promptData.prompt_content || prev.custom_prompt || '',
        // Từ user-config service feature
        enable_service_consulting: serviceFeatureData?.enabled ?? prev.enable_service_consulting ?? true,
        // Từ user-config accessory feature
        enable_accessory_consulting: accessoryFeatureData?.enabled ?? prev.enable_accessory_consulting ?? true,
      }));
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Hàm tải tài liệu (kết nối API)
  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const responseData = await listDocuments();
      setDocuments(responseData);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrders([]);
    setIsLoadingOrders(false);
  };

  // Tải dữ liệu khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    } else if (activeTab === 'documents') {
      loadDocuments();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [selectedOrderType, activeTab]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof CombinedSettings) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Hàm lưu cài đặt (gọi tất cả API liên quan)
  const handleSaveSettings = async () => {
    const personaRole = settings.chatbot_role?.trim();
    const personaName = settings.chatbot_name?.trim();

    if (!personaRole || !personaName) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập đầy đủ tên chatbot và vai trò (persona).',
      });
      return;
    }

    const escapeHtml = (value?: string) =>
      (value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const truncate = (value?: string, len = 160) => {
      const safe = escapeHtml(value);
      return safe.length > len ? `${safe.slice(0, len)}...` : safe || '(trống)';
    };

    const summaryHtml = `
      <div class="text-left text-sm space-y-3">
        <div>
          <p class="font-semibold">Persona</p>
          <p>Role: <strong>${escapeHtml(personaRole)}</strong></p>
          <p>Name: <strong>${escapeHtml(personaName)}</strong></p>
          <p>Tone: <strong>${escapeHtml(settings.persona_tone || '(trống)')}</strong></p>
        </div>
        <div>
          <p class="font-semibold">Prompt</p>
          <p>Language: <strong>${escapeHtml(settings.prompt_language || 'vi')}</strong></p>
          <p>Content: ${truncate(settings.custom_prompt)}</p>
        </div>
        <div>
          <p class="font-semibold">Tính năng</p>
          <p>Tư vấn dịch vụ: <strong>${settings.enable_service_consulting ? 'Bật' : 'Tắt'}</strong></p>
          <p>Tư vấn phụ kiện: <strong>${settings.enable_accessory_consulting ? 'Bật' : 'Tắt'}</strong></p>
        </div>
      </div>
    `;

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận lưu cài đặt chatbot?',
      html: summaryHtml,
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy',
      focusCancel: true,
      width: 600,
    });

    if (!confirmation.isConfirmed) return;

    setIsSavingSettings(true);
    try {
      const personaPayload = {
        role: personaRole,
        name: personaName,
        tone: settings.persona_tone?.trim() || undefined,
        ai_role: personaRole,
        ai_name: personaName,
      };

      const userPromptPayload = {
        system_prompt: settings.custom_prompt || '',
        custom_prompt: settings.custom_prompt || '',
        language: settings.prompt_language || 'vi',
      };

      const serviceFeaturePayload = {
        enabled: Boolean(settings.enable_service_consulting),
      };

      const accessoryFeaturePayload = {
        enabled: Boolean(settings.enable_accessory_consulting),
      };

      await Promise.all([
        // updateChatbotSettings(chatbotSettingsPayload),
        // upsertMyBotConfig(botConfigPayload),
        // updateSystemPrompt(settings.custom_prompt || ''),
        updatePersonaConfig(personaPayload),
        updatePromptConfig(userPromptPayload),
        updateServiceFeatureConfig(serviceFeaturePayload),
        updateAccessoryFeatureConfig(accessoryFeaturePayload),
      ]);

      await Swal.fire({
        icon: 'success',
        title: 'Đã lưu cài đặt',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt:', error);
      const apiError = error as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      const message =
        apiError?.response?.data?.detail ||
        apiError?.response?.data?.message ||
        apiError?.message ||
        'Lưu cài đặt thất bại!';
      await Swal.fire({
        icon: 'error',
        title: 'Lưu thất bại',
        text: message,
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // --- XỬ LÝ UPLOAD TÀI LIỆU ---

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      handleUploadFile(file);
    }
  };

  // Xử lý kéo thả
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  // Hàm gọi API upload file
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadFileDocument(file);
      alert(`Đã tải lên file: ${file.name}`);
      loadDocuments();
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      alert('Tải file thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  // Tải lên Văn bản
  const handleUploadText = async () => {
    const text = window.prompt("Nhập nội dung văn bản:");
    if (!text) return;
    const source = window.prompt("Nhập tên nguồn (ví dụ: 'chinh_sach_doi_tra'):", "noi_dung_van_ban");
    if (!source) return;

    setIsUploading(true);
    try {
      await uploadTextDocument(text, source);
      alert('Đã tải lên văn bản');
      loadDocuments();
    } catch (error) {
      console.error('Lỗi khi tải văn bản:', error);
      alert('Tải văn bản thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  // Tải lên URL
  const handleUploadUrl = async () => {
    const url = window.prompt("Nhập URL cần tải:");
    if (!url) return;

    setIsUploading(true);
    try {
      await uploadUrlDocument(url, url); // Dùng URL làm tên nguồn
      alert('Đã tải lên URL');
      loadDocuments();
    } catch (error) {
      console.error('Lỗi khi tải URL:', error);
      alert('Tải URL thất bại');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Lấy toàn bộ Website
  const handleUploadWebsite = async () => {
    const website_url = window.prompt("Nhập URL website (ví dụ: https://example.com):");
    if (!website_url) return;

    setIsUploading(true);
    try {
      const result = await uploadWebsite(website_url);
      alert(`Đã bắt đầu quét website. Task ID: ${result.task_id}`);
    } catch (error) {
      console.error('Lỗi khi quét website:', error);
      alert('Bắt đầu quét website thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ẩn input file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx" // TODO: Cập nhật các định dạng được phép
      />
          
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chatbot</h1>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              <Plus size={16} />
              Thêm mới
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              onClick={() => {
                 if (activeTab === 'documents') loadDocuments();
                 else if (activeTab === 'settings') loadSettings();
                 else if (activeTab === 'orders') loadOrders();
              }}
              disabled={isLoadingDocuments || isLoadingSettings || isLoadingOrders}
            >
              {isLoadingDocuments || isLoadingSettings || isLoadingOrders ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Làm mới
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Document Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tải lên tài liệu</h3>
                {isUploading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tải lên tài liệu chứa các thông tin về cửa hàng của bạn, ví dụ: địa chỉ, các chính sách, hỗ trợ,...
              </p>
              {/* File Upload Dropzone */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Kéo thả file vào đây hoặc <span className="text-blue-500 font-medium">click để chọn file</span></p>
                <p className="text-xs text-gray-500">Hỗ trợ: .txt, .pdf, .doc, .docx</p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  onClick={handleUploadText}
                  disabled={isUploading}
                >
                  <Upload size={16} />
                  Tải lên văn bản
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  onClick={handleUploadUrl}
                  disabled={isUploading}
                >
                  <Link size={16} />
                  Tải lên URL
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  onClick={handleUploadWebsite}
                  disabled={isUploading}
                >
                  <Globe size={16} />
                  Lấy toàn bộ Website
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Nguồn Tài Liệu ({documents.length})</h3>
              </div>
              {isLoadingDocuments ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Chưa có tài liệu nào được tải lên.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-medium text-gray-800 truncate" title={doc.name}>{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.type}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {/* TODO: Thêm handler cho các nút này */}
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Xem</button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Sửa</button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          // Nội dung tab Đơn hàng giữ nguyên như code của bạn
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Quản lý Đơn hàng</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Theo dõi và quản lý các đơn hàng điện thoại, dịch vụ và linh kiện
            </p>
            {/* Order Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {orderTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-6 bg-white rounded-xl border-2 text-center cursor-pointer transition-all ${
                    selectedOrderType === type.id
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedOrderType(type.id)}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {type.icon}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{type.name}</h4>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
                    {type.count} đơn hàng
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>

            {/* Empty State / List */}
            {isLoadingOrders ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Không có đơn hàng nào</p>
                  <p className="text-gray-500 text-sm mb-6">
                    Chưa có đơn hàng nào, cài đặt chatbot để bắt đầu nhận đơn hàng
                  </p>
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    onClick={() => setActiveTab('settings')} // Chuyển sang tab cài đặt
                  >
                    Cài đặt Chatbot
                  </button>
                </div>
            ) : (
              // TODO: Render danh sách đơn hàng khi có dữ liệu
              <div>{/* Render list of orders here */}</div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <>
            {isLoadingSettings ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Cài đặt Hệ thống</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Cấu hình chatbot AI và các tính năng của hệ thống
                </p>

                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên Chatbot AI</label>
                    <input
                      type="text"
                      name="chatbot_name"
                      placeholder="Nhập tên chatbot"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={settings.chatbot_name || ''}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai Trò Chatbot</label>
                    <input
                      type="text"
                      name="chatbot_role"
                      placeholder="Nhập vai trò chatbot"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={settings.chatbot_role || ''}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Persona Tone</label>
                    <input
                      type="text"
                      name="persona_tone"
                      placeholder="Ví dụ: thân thiện, chuyên nghiệp..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={settings.persona_tone || ''}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>

                {/* Custom Prompt (Bot Linh Kiện) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt Tùy Chỉnh (Bot Linh Kiện)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Prompt này chỉ áp dụng cho Bot Tư vấn Linh Kiện. Để trống để dùng prompt mặc định.
                  </p>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ngôn ngữ trả lời</label>
                    <select
                      name="prompt_language"
                      value={settings.prompt_language || 'vi'}
                      onChange={handleSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">Tiếng Anh</option>
                    </select>
                  </div>
                  <textarea
                    name="custom_prompt"
                    placeholder="Nhập prompt tùy chỉnh cho bot linh kiện..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={settings.custom_prompt || ''}
                    onChange={handleSettingsChange}
                  />
                </div>

                {/* System Features */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Tính Năng Hệ Thống</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-700">Tư Vấn Dịch Vụ</div>
                        <div className="text-sm text-gray-500">Cho phép chatbot tư vấn về các dịch vụ</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.enable_service_consulting || false}
                          onChange={() => handleToggleChange('enable_service_consulting')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-gray-700">Tư Vấn Phụ Kiện</div>
                        <div className="text-sm text-gray-500">Cho phép chatbot tư vấn về phụ kiện</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.enable_accessory_consulting || false}
                          onChange={() => handleToggleChange('enable_accessory_consulting')} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* System Prompt (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">System Prompt (Mặc định)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Đây là prompt mặc định của hệ thống.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
                    {(() => {
                      const systemPromptValue = `**QUY TẮC BẮT BUỘC PHẢI TUÂN THEO:**\n\n1. **Sản phẩm có nhiều model, combo, cỡ, màu sắc,... (tùy thuộc tính):**\n   - Khi giới thiệu lần đầu, chỉ nói tên sản phẩm chính và hãy thông báo có nhiều màu hoặc có nhiều model hoặc có nhiều cỡ,... (tùy vào thuộc tính của sản phẩm).\n   - **Khi khách hỏi trực tiếp về số lượng** (ví dụ: "chỉ có 3 màu thôi à?"), bạn phải trả lời thẳng vào câu hỏi.`;
                      const characterCount = systemPromptValue.length;
                      return (
                        <>
                          <textarea
                            readOnly
                            rows={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                            value={systemPromptValue}
                          />
                          <div className="text-xs text-gray-500 text-right mt-2">
                            {characterCount.toLocaleString('vi-VN')} ký tự
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                    Hủy
                  </button>
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center min-w-[120px]"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Lưu cài đặt'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotManagement;