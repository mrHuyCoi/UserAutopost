// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import { Navigate, useParams, useNavigate } from 'react-router-dom';
// import { 
//   Smartphone, MessageSquare, Package, Settings, Wrench, 
//   ChevronDown, ChevronRight, BotMessageSquare, Bot
// } from 'lucide-react';
// import { SiZalo } from "react-icons/si";

// // Import all tab components
// import DevicesTab from './ChatbotPage/DevicesTab';
// import ColorsTab from './ChatbotPage/ColorsTab';
// import SettingsTab from './ChatbotPage/SettingsTab';
// import StoreSettingsTab from './ChatbotPage/StoreSettingsTab';
// import DocumentsTab from './ChatbotPage/DocumentsTab';
// import DeviceColorsTab from './ChatbotPage/DeviceColorsTab';
// import DeviceInfosTab from './ChatbotPage/DeviceInfosTab';
// import DeviceStorageTab from './ChatbotPage/DeviceStorageTab';
// import ChatbotTab from './ChatbotPage/ChatbotTab';
// import UrlDevicesTab from './ChatbotPage/UrlDevicesTab';
// import { ServiceManagementPage } from './ServiceManagementPage';
// import ChatbotLinhKienTab from './ChatbotPage/ChatbotLinhKienTab';
// import ApiIntegrationPage from './ApiIntegrationPage';
// import ApiDataSyncTab from './ChatbotPage/ApiDataSyncTab';
// import BotPowerTab from './ChatbotPage/BotPowerTab';
// import ProductComponentsTab from './ChatbotPage/ProductComponentsTab';
// import FaqMobileTab from './ChatbotPage/FaqMobileTab';
// import ZaloTab from './ChatbotPage/ZaloTab';
// import ZaloOATab from './ChatbotPage/ZaloOATab';
// import OrdersTab from './ChatbotPage/OrdersTab';
// import OrdersCustomTab from './ChatbotPage/OrdersCustomTab';
// import SettingsCustomTab from './ChatbotPage/SettingsCustomTab';
// import ErrorBoundary from './ChatbotPage/ErrorBoundary';
// import FacebookConversationsTab from './ChatbotPage/FacebookConversationsTab';

// type MainCategory = 'products' | 'services' | 'chatbots' | 'channels' | 'settings';
// type SubTab =
//   | 'my-devices'
//   | 'url-devices'
//   | 'device-info'
//   | 'colors'
//   | 'device-colors'
//   | 'device-storage'
//   | 'services'
//   | 'components'
//   | 'api-data-sync'
//   | 'documents'
//   | 'api-integration'
//   | 'settings'
//   | 'bot-power'
//   | 'store-settings'
//   | 'orders'
//   | 'chat'
//   | 'fb-ig'
//   | 'faq-mobile'
//   | 'zalo-login'
//   | 'zalo-messages'
//   | 'zalo-oa-connect'
//   | 'zalo-oa-inbox'
//   | 'dichvu'
//   | 'linhkien'
//   | 'chatbot-linhkien'
//   | 'orders-custom'
//   | 'settings-custom'
//   | 'caidat'
//   | 'zalo'
//   | 'zalo-oa'
//   | 'messenger'
//   | 'conversations';

// // Helper function to check if component accepts pagination props
// const createTabComponent = (
//   Component: React.ComponentType<any>,
//   acceptsPagination: boolean,
//   page: number,
//   limit: number,
//   onPageChange: (page: number) => void,
//   onLimitChange: (limit: number) => void
// ) => {
//   if (acceptsPagination) {
//     return <Component currentPage={page} currentLimit={limit} onPageChange={onPageChange} onLimitChange={onLimitChange} />;
//   }
//   return <Component />;
// };

// const getMainTabsConfig = (
//   page: number,
//   limit: number,
//   onPageChange: (page: number) => void,
//   onLimitChange: (limit: number) => void,
// ): Record<MainCategory, {
//   label: string;
//   icon: JSX.Element;
//   isSingleTab?: true;
//   component?: JSX.Element;
//   subTabs?: Array<{ id: SubTab; label: string; component: JSX.Element }>;
// }> => ({
//   products: {
//     label: 'Sản phẩm',
//     icon: <Package className="w-5 h-5 text-green-500" />,
//     subTabs: [
//       { 
//         id: 'components', 
//         label: 'Linh kiện', 
//         component: <ErrorBoundary>
//           {createTabComponent(ProductComponentsTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'my-devices', 
//         label: 'Điện thoại', 
//         component: <ErrorBoundary>
//           {createTabComponent(DevicesTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'api-data-sync', 
//         label: 'Nạp dữ liệu API', 
//         component: <ErrorBoundary>
//           {createTabComponent(ApiDataSyncTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//     ]
//   },
//   services: {
//     label: 'Dịch vụ',
//     icon: <Wrench className="w-5 h-5 text-orange-500" />,
//     isSingleTab: true,
//     component: <ErrorBoundary>
//       {createTabComponent(ServiceManagementPage, true, page, limit, onPageChange, onLimitChange)}
//     </ErrorBoundary>
//   },
//   chatbots: {
//     label: 'Chatbot',
//     icon: <BotMessageSquare className="w-5 h-5 text-purple-500" />,
//     subTabs: [
//       { 
//         id: 'chat', 
//         label: 'Chatbot Agent', 
//         component: <ErrorBoundary>
//           {createTabComponent(ChatbotTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'chatbot-linhkien', 
//         label: 'Chatbot Linh kiện', 
//         component: <ErrorBoundary>
//           {createTabComponent(ChatbotLinhKienTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'documents', 
//         label: 'Tài liệu', 
//         component: <ErrorBoundary>
//           {createTabComponent(DocumentsTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'orders', 
//         label: 'Đơn hàng Agent', 
//         component: <ErrorBoundary>
//           {createTabComponent(OrdersTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'orders-custom', 
//         label: 'Đơn hàng Linh kiện', 
//         component: <ErrorBoundary>
//           {createTabComponent(OrdersCustomTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//     ]
//   },
//   channels: {
//     label: 'Kênh kết nối',
//     icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
//     subTabs: [
//       { 
//         id: 'zalo', 
//         label: 'Zalo Cá nhân', 
//         component: <ErrorBoundary>
//           {createTabComponent(ZaloTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'zalo-oa', 
//         label: 'Zalo OA', 
//         component: <ErrorBoundary>
//           {createTabComponent(ZaloOATab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'messenger', 
//         label: 'Messenger', 
//         component: <ErrorBoundary>
//           {createTabComponent(FacebookConversationsTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'conversations', 
//         label: 'Quản lý hội thoại', 
//         component: <div className="p-6 text-center text-gray-500">
//           Quản lý hội thoại - Tính năng đang phát triển
//         </div> 
//       },
//     ]
//   },
//   settings: {
//     label: 'Cài đặt',
//     icon: <Settings className="w-5 h-5 text-gray-600" />,
//     subTabs: [
//       { 
//         id: 'settings', 
//         label: 'Cài đặt Chatbot', 
//         component: <ErrorBoundary>
//           {createTabComponent(SettingsTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'settings-custom', 
//         label: 'Cài đặt Prompt', 
//         component: <ErrorBoundary>
//           {createTabComponent(SettingsCustomTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'api-integration', 
//         label: 'Tích hợp API', 
//         component: <ErrorBoundary>
//           {createTabComponent(ApiIntegrationPage, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'bot-power', 
//         label: 'Bật/Tắt Bot', 
//         component: <ErrorBoundary>
//           {createTabComponent(BotPowerTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'store-settings', 
//         label: 'Thông tin cửa hàng', 
//         component: <ErrorBoundary>
//           {createTabComponent(StoreSettingsTab, false, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       },
//       { 
//         id: 'faq-mobile', 
//         label: 'Câu hỏi thường gặp', 
//         component: <ErrorBoundary>
//           {createTabComponent(FaqMobileTab, true, page, limit, onPageChange, onLimitChange)}
//         </ErrorBoundary> 
//       }
//     ]
//   }
// });

// const ChatbotPageWithTabs: React.FC = () => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const { tab, page, limit } = useParams<{ tab?: string; page?: string; limit?: string }>();
//   const navigate = useNavigate();
//   const [openCategory, setOpenCategory] = useState<MainCategory | null>('products');
//   const [activeTab, setActiveTab] = useState<SubTab>('components');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   const urlPage = parseInt(page || '1', 10);
//   const urlLimit = parseInt(limit || '15', 10);

//   const handlePageChange = useCallback((newPage: number) => {
//     localStorage.setItem(`chatbot-pagination-${activeTab}-page`, newPage.toString());
//     navigate(`/chatbot-tabs/${activeTab}/${newPage}/${urlLimit}`);
//   }, [activeTab, urlLimit, navigate]);

//   const handleLimitChange = useCallback((newLimit: number) => {
//     localStorage.setItem(`chatbot-pagination-${activeTab}-limit`, newLimit.toString());
//     localStorage.setItem(`chatbot-pagination-${activeTab}-page`, '1');
//     navigate(`/chatbot-tabs/${activeTab}/1/${newLimit}`);
//   }, [activeTab, navigate]);

//   // Initialize state from URL parameters
//   useEffect(() => {
//     if (!isAuthenticated || isLoading) {
//       return;
//     }

//     if (tab) {
//       setActiveTab(tab as SubTab);
      
//       const mainTabsConfig = getMainTabsConfig(urlPage, urlLimit, handlePageChange, handleLimitChange);
//       const categoryForTab = Object.entries(mainTabsConfig).find(([key, config]) => {
//         if (config.isSingleTab && key === tab) {
//           return true;
//         }
//         if (config.subTabs) {
//           return config.subTabs.some(subTab => subTab.id === tab);
//         }
//         return false;
//       });
      
//       if (categoryForTab) {
//         const [categoryKey, categoryConfig] = categoryForTab;
//         if (!categoryConfig.isSingleTab) {
//           setOpenCategory(categoryKey as MainCategory);
//         } else {
//           setOpenCategory(null);
//         }
//       }
      
//       if (page && limit) {
//         const pageNum = parseInt(page, 10);
//         const limitNum = parseInt(limit, 10);
//         if (!isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0) {
//           localStorage.setItem(`chatbot-pagination-${tab}-page`, pageNum.toString());
//           localStorage.setItem(`chatbot-pagination-${tab}-limit`, limitNum.toString());
//         }
//       } else {
//         const savedPage = localStorage.getItem(`chatbot-pagination-${tab}-page`);
//         const savedLimit = localStorage.getItem(`chatbot-pagination-${tab}-limit`);
//         const defaultPage = savedPage ? parseInt(savedPage, 10) : 1;
//         const defaultLimit = savedLimit ? parseInt(savedLimit, 10) : 15;
//         navigate(`/chatbot-tabs/${tab}/${defaultPage}/${defaultLimit}`, { replace: true });
//         return;
//       }
//     } else {
//       const savedPage = localStorage.getItem('chatbot-pagination-components-page') || '1';
//       const savedLimit = localStorage.getItem('chatbot-pagination-components-limit') || '15';
//       navigate(`/chatbot-tabs/components/${savedPage}/${savedLimit}`, { replace: true });
//       return;
//     }
//   }, [tab, page, limit, urlPage, urlLimit, navigate, isAuthenticated, isLoading, handlePageChange, handleLimitChange]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   const renderTabContent = () => {
//     const mainTabsConfig = getMainTabsConfig(urlPage, urlLimit, handlePageChange, handleLimitChange);

//     let singleCategory: { isSingleTab?: true; component?: JSX.Element } | undefined;
//     if ((activeTab as string) in (mainTabsConfig as Record<string, unknown>)) {
//       singleCategory = (mainTabsConfig as Record<string, { isSingleTab?: true; component?: JSX.Element }>)[activeTab as string];
//     }
//     if (singleCategory?.isSingleTab && singleCategory.component) return singleCategory.component;

//     for (const category of Object.values(mainTabsConfig)) {
//       if (category.subTabs) {
//         const tabCfg = category.subTabs.find((sub: { id: SubTab; label: string; component: JSX.Element }) => sub.id === activeTab);
//         if (tabCfg) return tabCfg.component;
//       }
//     }
    
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500">Nội dung không tồn tại</p>
//       </div>
//     );
//   };

//   const handleCategoryClick = (categoryKey: MainCategory) => {
//     const mainTabsConfig = getMainTabsConfig(urlPage, urlLimit, handlePageChange, handleLimitChange);
//     const category = mainTabsConfig[categoryKey];
    
//     if (category.isSingleTab) {
//       const tabId = categoryKey as SubTab;
//       const savedPage = localStorage.getItem(`chatbot-pagination-${tabId}-page`) || '1';
//       const savedLimit = localStorage.getItem(`chatbot-pagination-${tabId}-limit`) || '15';
      
//       setActiveTab(tabId);
//       navigate(`/chatbot-tabs/${tabId}/${savedPage}/${savedLimit}`);
//       setMobileMenuOpen(false);
//     } else {
//       setOpenCategory(openCategory === categoryKey ? null : categoryKey);
//     }
//   };

//   const handleTabClick = (tabId: SubTab) => {
//     const savedPage = localStorage.getItem(`chatbot-pagination-${tabId}-page`) || '1';
//     const savedLimit = localStorage.getItem(`chatbot-pagination-${tabId}-limit`) || '15';
    
//     setActiveTab(tabId);
//     navigate(`/chatbot-tabs/${tabId}/${savedPage}/${savedLimit}`);
//     setMobileMenuOpen(false);
//   };

//   const mainTabsConfig = getMainTabsConfig(urlPage, urlLimit, handlePageChange, handleLimitChange);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="flex h-screen">
//         {/* Sidebar */}
//         <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-md flex-shrink-0 overflow-y-auto`}>
//           <div className="p-6 border-b">
//             <h2 className="text-xl font-bold text-gray-800 text-center">Quản lý Chatbot</h2>
//           </div>
//           <nav className="p-4">
//             <ul className="space-y-2">
//               {Object.entries(mainTabsConfig).map(([key, value]) => (
//                 <li key={key}>
//                   <div
//                     className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-colors ${
//                       value.isSingleTab && activeTab === key 
//                         ? 'bg-blue-500 text-white' 
//                         : 'hover:bg-gray-200'
//                     }`}
//                     onClick={() => handleCategoryClick(key as MainCategory)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       {value.icon}
//                       <span className={`font-semibold ${value.isSingleTab && activeTab === key ? 'text-white' : 'text-gray-700'}`}>
//                         {value.label}
//                       </span>
//                     </div>
//                     {!value.isSingleTab && (
//                       openCategory === key ? 
//                         <ChevronDown className="w-4 h-4" /> : 
//                         <ChevronRight className="w-4 h-4" />
//                     )}
//                   </div>
                  
//                   {!value.isSingleTab && openCategory === key && (
//                     <ul className="ml-8 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
//                       {value.subTabs?.map((subTab) => (
//                         <li key={subTab.id}>
//                           <button
//                             className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
//                               activeTab === subTab.id 
//                                 ? 'bg-blue-500 text-white font-medium' 
//                                 : 'text-gray-600 hover:bg-gray-100'
//                             }`}
//                             onClick={() => handleTabClick(subTab.id)}
//                           >
//                             {subTab.label}
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50">
//           <div className="p-6">
//             {/* Content Header */}
//             <div className="mb-6">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {Object.values(mainTabsConfig).flatMap(category => 
//                     category.subTabs?.find(sub => sub.id === activeTab)?.label || 
//                     (category.isSingleTab && activeTab === Object.keys(mainTabsConfig).find(key => key === activeTab) ? category.label : '')
//                   ).find(Boolean) || 'Quản lý Chatbot'}
//                 </h1>
//                 <div className="flex flex-wrap gap-2">
//                   <button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     <span>Thêm mới</span>
//                   </button>
//                   <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     <span>Làm mới</span>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Tab Content */}
//             <div className="bg-white rounded-xl shadow-sm">
//               {renderTabContent()}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ChatbotPageWithTabs;