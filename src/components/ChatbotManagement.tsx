import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  FileText,
  Upload,
  Link,
  Globe,
  Edit,
  Trash2,
  Smartphone,
  Wrench,
  Cpu,
  Loader2
} from 'lucide-react';
import { getChatbotSettings, updateChatbotSettings, ChatbotSettings } from '../services/chatbotJSService'; 
import { getMyBotConfig, upsertMyBotConfig, BotConfig } from '../services/botConfigService'; 
import { listDocuments, uploadFileDocument, uploadTextDocument, uploadUrlDocument, uploadWebsite } from '../services/documentService';
import { getSystemPrompt, updateSystemPrompt } from '../services/componentService';

// Interface cho state của form (đã có trong code của bạn)
interface CombinedSettings extends ChatbotSettings {
  chatbot_role: string;
  custom_prompt: string;
  enable_service_consulting: boolean;
  enable_accessory_consulting: boolean;
  stop_minutes: number;
}

// Interface cho tài liệu (đã có trong code của bạn)
interface Document {
  id: string;
  name: string;
  type: string;
}

// --- Component ---

const ChatbotManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'orders' | 'settings'>('documents');
  const [selectedOrderType, setSelectedOrderType] = useState<'phone' | 'service' | 'component'>('phone');
  
  // State cho dữ liệu
  const [documents, setDocuments] = useState<Document[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<Partial<CombinedSettings>>({
    chatbot_name: '',
    chatbot_role: '',
    custom_prompt: '',
    enable_service_consulting: true,
    enable_accessory_consulting: true,
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
  const tabs = [
    { id: 'documents', label: 'Quản lý Tài liệu' },
    { id: 'orders', label: 'Quản lý Đơn hàng' },
    { id: 'settings', label: 'Cài đặt Hệ thống' },
  ];

  const orderTypes = [
    { id: 'phone', name: 'Đơn Hàng Điện Thoại', count: 0, description: 'Quản lý các đơn hàng điện thoại', icon: <Smartphone size={24} /> },
    { id: 'service', name: 'Đơn Hàng Dịch Vụ', count: 0, description: 'Quản lý các đơn hàng dịch vụ sửa chữa', icon: <Wrench size={24} /> },
    { id: 'component', name: 'Đơn Hàng Linh Kiện', count: 0, description: 'Quản lý các đơn hàng linh kiện', icon: <Cpu size={24} /> },
  ];
  

  // Hàm tải cài đặt (từ 3 nguồn)
  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      // Tải song song cả 3 cấu hình
      const [settingsData, botConfigData, promptData] = await Promise.all([
        getChatbotSettings(),
        getMyBotConfig(), // Mặc định lấy "me"
        getSystemPrompt()    // Lấy prompt của bot linh kiện
      ]);

      setSettings(prev => ({
        ...prev,
        ...settingsData,
        stop_minutes: botConfigData.data?.stop_minutes || 0,
        custom_prompt: promptData.prompt_content || '',
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof CombinedSettings) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Hàm lưu cài đặt (lưu vào 3 nguồn)
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // 1. Payload cho API Chatbot JS (Tên, Icon, Role, Toggles)
      const chatbotSettingsPayload: ChatbotSettings = {
        chatbot_name: settings.chatbot_name,
        chatbot_icon_url: settings.chatbot_icon_url,
        chatbot_message_default: settings.chatbot_message_default,
        chatbot_callout: settings.chatbot_callout,
        chatbot_role: settings.chatbot_role, // Đã thêm
        enable_service_consulting: settings.enable_service_consulting, // Đã thêm
        enable_accessory_consulting: settings.enable_accessory_consulting, // Đã thêm
      };
      
      // 2. Payload cho API Bot Zalo (Stop Minutes)
      const botConfigPayload = {
        stop_minutes: Number(settings.stop_minutes),
      };

      // 3. Payload cho API Bot Linh Kiện (Custom Prompt)
      const promptPayload = settings.custom_prompt || '';

      // Gọi song song cả 3 API
      await Promise.all([
        updateChatbotSettings(chatbotSettingsPayload),
        upsertMyBotConfig(botConfigPayload),
        updateSystemPrompt(promptPayload)
      ]);
      
      alert('Đã lưu cài đặt!');

    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      alert('Lưu cài đặt thất bại!');
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
              onClick={() => setActiveTab(tab.id as any)}
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
                  onClick={() => setSelectedOrderType(type.id as any)}
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
                </div>

                {/* Custom Prompt (Bot Linh Kiện) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt Tùy Chỉnh (Bot Linh Kiện)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Prompt này chỉ áp dụng cho Bot Tư vấn Linh Kiện. Để trống để dùng prompt mặc định.
                  </p>
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
                    <textarea
                      readOnly
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                      value={`**QUY TẮC BẮT BUỘC PHẢI TUÂN THEO:**\n\n1. **Sản phẩm có nhiều model, combo, cỡ, màu sắc,... (tùy thuộc tính):**\n   - Khi giới thiệu lần đầu, chỉ nói tên sản phẩm chính và hãy thông báo có nhiều màu hoặc có nhiều model hoặc có nhiều cỡ,... (tùy vào thuộc tính của sản phẩm).\n   - **Khi khách hỏi trực tiếp về số lượng** (ví dụ: "chỉ có 3 màu thôi à?"), bạn phải trả lời thẳng vào câu hỏi.`}
                    />
                    <div className="text-xs text-gray-500 text-right mt-2">3.676 ký tự</div>
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