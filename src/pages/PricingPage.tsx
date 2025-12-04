// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
// --- TYPE DEFINITIONS ---
interface VideoPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_videos_per_day: number;
  max_scheduled_days: number;
  max_stored_videos: number;
  storage_limit_gb: number;
  max_social_accounts: number;
  ai_content_generation: boolean;
  is_active: boolean;
}

interface ChatbotService {
    id: string;
    name: string;
    description: string;
    base_price: number;
}

interface ChatbotPlan {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    services: ChatbotService[];
}

interface VideoSubscription {
  id: string;
  plan: VideoPlan;
  subscription_plan: VideoPlan;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface ChatbotSubscription {
    id: string;
    plan: ChatbotPlan;
    start_date: string;
    end_date: string;
    is_active: boolean;
    months_subscribed: number;
    total_price: number;
}

interface MySubscriptions {
    video_subscription: VideoSubscription | null;
    chatbot_subscription: ChatbotSubscription | null;
}

type Plan = VideoPlan | ChatbotPlan;

// API client
const api = {
  get: async <T,>(url: string, token?: string | null): Promise<{ data: T }> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}${url}`, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.detail || errorData.message || 'An unknown error occurred');
    }

    const data = await response.json();
    return { data };
  },

  post: async <T, U>(url: string, body: U, token?: string | null): Promise<{ data: T; status: number }> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    const responseData = await response.json().catch(() => null);

    if (![200, 201].includes(response.status)) {
        const errorMessage = responseData?.detail || responseData?.message || `Lỗi máy chủ: ${response.statusText}`;
        throw new Error(errorMessage);
    }
    
    return { data: responseData, status: response.status };
  },
};

// Helper functions
const formatPrice = (price: number) => {
  if (price === 0) return "0đ";
  return `${(price / 1000).toLocaleString('de-DE')}K`;
};

const formatDuration = (plan: Plan) => {
    if ('duration_days' in plan) {
        if (plan.name === 'Chuyên nghiệp') return '/ năm';
        if (plan.duration_days >= 90) return `/ ${plan.duration_days / 30} tháng`;
        if (plan.duration_days >= 30) return '/ tháng';
        return `/ ${plan.duration_days || 0} ngày`;
    }
    if ('monthly_price' in plan) {
        return '/ tháng';
    }
    return '';
};

const calculateRemainingDays = (endDate: string): number | null => {
    if (!endDate) return null;
    try {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : 0;
    } catch (error) {
        console.error('Error calculating remaining days:', error);
        return null;
    }
};

// Icon components để thay thế Font Awesome
const StarIcon = () => (
  <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
  </svg>
);

const RobotIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z"/>
    <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
  </svg>
);

const HardDriveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
  </svg>
);

const PlugIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1H7a1 1 0 000 2h2v1a1 1 0 01-2 0V6H6a1 1 0 000 2h1v1a1 1 0 01-2 0V8H4a1 1 0 000 2h1v1a1 1 0 01-2 0v-1H2a1 1 0 100 2h1v1a1 1 0 01-2 0v-2a1 1 0 00-1-1 1 1 0 010-2h1V9a1 1 0 01-2 0V8H1a1 1 0 100-2h1V5a1 1 0 01-2 0V4a1 1 0 011-1h16a1 1 0 011 1v1a1 1 0 01-2 0V5h-1a1 1 0 100-2h1V3a1 1 0 00-1-1h-6z" clipRule="evenodd"/>
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

const ChartLineIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
  </svg>
);

const CloudIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
  </svg>
);

export const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'video' | 'chatbot'>('video');

  const [videoPlans, setVideoPlans] = useState<VideoPlan[]>([]);
  const [chatbotPlans, setChatbotPlans] = useState<ChatbotPlan[]>([]);

  const [currentSubs, setCurrentSubs] = useState<MySubscriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  useEffect(() => {
    const param = new URLSearchParams(location.search);
    const tab = param.get('tab');
    if (tab === 'chatbot' || tab === 'video') {
        setActiveTab(tab as 'video' | 'chatbot');
    }
  }, [location.search]);
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('auth_token');
      
      try {
        setLoading(true);
        setError(null);
        
        const videoPlansPromise = api.get<VideoPlan[]>('/api/v1/subscriptions/plans', token);
        const chatbotPlansPromise = api.get<ChatbotPlan[]>('/api/v1/chatbot-subscriptions/plans', token);
        
        const [videoPlansResponse, chatbotPlansResponse] = await Promise.all([videoPlansPromise, chatbotPlansPromise]);

        // Process Video Plans
        if (videoPlansResponse && Array.isArray(videoPlansResponse.data)) {
          const sortedPlans = videoPlansResponse.data
            .filter((p: VideoPlan) => p && p.is_active)
            .sort((a: VideoPlan, b: VideoPlan) => (a.price || 0) - (b.price || 0));
          setVideoPlans(sortedPlans);
        } else {
          setVideoPlans([]);
        }

        // Process Chatbot Plans
        if (chatbotPlansResponse && Array.isArray(chatbotPlansResponse.data)) {
            setChatbotPlans(chatbotPlansResponse.data.filter(p => p).sort((a,b) => a.monthly_price - b.monthly_price));
        } else {
          setChatbotPlans([]);
        }
        
        if (isAuthenticated && token) {
          const videoSubsPromise = api.get<MySubscriptions>('/api/v1/subscriptions/me', token);
          const chatbotSubsPromise = api.get<ChatbotSubscription>('/api/v1/chatbot-subscriptions/me', token);

          const results = await Promise.allSettled([videoSubsPromise, chatbotSubsPromise]);

          const videoResult = results[0];
          const chatbotResult = results[1];
          
          let finalVideoSub: VideoSubscription | null = null;
          let finalChatbotSub: ChatbotSubscription | null = null;

          if (videoResult.status === 'fulfilled') {
              finalVideoSub = videoResult.value.data?.video_subscription || null;
              finalChatbotSub = videoResult.value.data?.chatbot_subscription || null; 
          }

          if (chatbotResult.status === 'fulfilled') {
              if (chatbotResult.value.data) {
                   finalChatbotSub = chatbotResult.value.data;
              }
          }

          setCurrentSubs({
              video_subscription: finalVideoSub,
              chatbot_subscription: finalChatbotSub
          });

        } else {
          setCurrentSubs({
            video_subscription: null,
            chatbot_subscription: null
          });
        }
        
      } catch (err: any) {
        console.error("Critical error when loading data:", err);
        if (videoPlans.length === 0 && chatbotPlans.length === 0) {
          setError(err.message || "Không thể tải dữ liệu bảng giá.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSelectPlan = async (plan: Plan) => {
    const token = localStorage.getItem('auth_token');

    if (!isAuthenticated || !token) {
        Swal.fire({
            title: 'Yêu cầu đăng nhập',
            text: 'Bạn cần đăng nhập hoặc đăng ký để chọn gói cước.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đăng nhập',
            cancelButtonText: 'Để sau',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/login';
            }
        });
        return;
    }

    if (('price' in plan && plan.price === 0)) {
      Swal.fire('Gói Miễn phí', 'Bạn không cần thanh toán cho gói miễn phí.', 'info');
      return;
    }

    const confirmation = await Swal.fire({
        title: 'Xác nhận chọn gói',
        html: `Bạn có chắc chắn muốn đăng ký <b>Gói ${plan.name}</b> không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    });

    if (confirmation.isConfirmed) {
        setIsSubscribing(plan.id);
        try {
          let response;
          if (activeTab === 'video' && 'duration_days' in plan) {
              response = await api.post(
                '/api/v1/subscriptions/',
                { subscription_id: plan.id },
                token
              );
          } else if (activeTab === 'chatbot' && 'monthly_price' in plan) {
              response = await api.post(
                  '/api/v1/chatbot-subscriptions/subscribe',
                  { plan_id: plan.id, months_subscribed: selectedMonths },
                  token
              );
          } else {
              throw new Error("Loại gói không hợp lệ.");
          }

          if (response.status === 201 || response.status === 200) {
            setSelectedPlan(plan);
            setIsQrModalOpen(true);
          }
        } catch (err: any) {
          Swal.fire({
            title: 'Đăng ký thất bại',
            text: err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            icon: 'error',
          });
        } finally {
          setIsSubscribing(null);
        }
    }
  };

  // Feature data for comparison tables
  const videoFeatureRows = [
    { name: "🔥 Giá bán", getValue: (p: VideoPlan) => formatPrice(p.price) },
    { name: "📅 Số video/ngày", getValue: (p: VideoPlan) => p.max_videos_per_day },
    { name: "📋 Lên lịch trước tối đa", getValue: (p: VideoPlan) => `${p.max_scheduled_days} ngày` },
    { name: "💾 Số video có thể lưu cùng lúc", getValue: (p: VideoPlan) => p.max_stored_videos },
    { name: "💽 Dung lượng lưu trữ khuyến nghị", getValue: (p: VideoPlan) => `${p.storage_limit_gb}GB` },
    { name: "🗑️ Tự động xóa video sau đăng", getValue: () => "3 ngày" },
    { name: "👥 Tổng số tài khoản MXH", getValue: (p: VideoPlan) => p.max_social_accounts, note: "(Fanpage, Reels, Instagram, YouTube)" },
    { name: "🤖 Hỗ trợ AI viết nội dung", getValue: (p: VideoPlan) => p.ai_content_generation },
    { name: "☁️ Lưu trữ trên", getValue: (p: VideoPlan) => p.storage_limit_gb > 10 ? "Đám mây, Nâng cao" : "Đám mây" },
  ];
  
  const chatbotFeatureRows = [
      { name: "💵 Giá / tháng", getValue: (p: ChatbotPlan) => formatPrice(p.monthly_price) },
      { name: "🤖 Dịch vụ tích hợp", getValue: (p: ChatbotPlan) => p.services.map(s => s.name).join(', ') },
      { name: "🔌 Tích hợp API", getValue: () => "✓" },
      { name: "💬 Script nhúng Website", getValue: () => "✓" },
      { name: "📊 Phân tích cuộc trò chuyện", getValue: () => "Sắp ra mắt" },
  ];

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <span className="yes">✓</span> : <span className="no">-</span>;
    }
    return <span>{value}</span>;
  };

  const plansToDisplay = activeTab === 'video' ? videoPlans : chatbotPlans;
  const featureRows = activeTab === 'video' ? videoFeatureRows : chatbotFeatureRows;
  
  const currentSub = activeTab === 'video' ? currentSubs?.video_subscription : currentSubs?.chatbot_subscription;
  const currentPlanDetails = currentSub ? 
    (activeTab === 'video' ? currentSub.subscription_plan : currentSub.plan) : null;
  
  const hasPendingSubscription = activeTab === 'chatbot' && 
                               currentSubs?.chatbot_subscription && 
                               !currentSubs.chatbot_subscription.is_active;
  
  const isCurrentPlan = (plan: Plan) => {
    if (!currentPlanDetails) return false;
    return plan.id === currentPlanDetails.id;
  };
  
  const canSubscribeToPlan = (plan: Plan) => {
    if (isSubscribing === plan.id) return false;
    if (isCurrentPlan(plan)) return false;
    if (hasPendingSubscription) return false;
    return true;
  };

  // Hàm render nút đăng ký thống nhất
  const renderSubscribeButton = (plan: Plan, isFree: boolean = false) => {
    const buttonText = isSubscribing === plan.id 
      ? 'Đang xử lý...' 
      : isCurrentPlan(plan) 
        ? 'Gói hiện tại' 
        : hasPendingSubscription 
          ? 'Đang chờ phê duyệt' 
          : 'ĐĂNG KÝ NGAY';

    const baseClasses = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center";
    
    if (isFree) {
      return (
        <button 
          onClick={() => handleSelectPlan(plan)}
          disabled={!canSubscribeToPlan(plan)}
          className={`${baseClasses} border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white`}
        >
          {buttonText}
        </button>
      );
    }

    return (
      <button 
        onClick={() => handleSelectPlan(plan)}
        disabled={!canSubscribeToPlan(plan)}
        className={`${baseClasses} bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-1 shadow-md hover:shadow-lg`}
      >
        {buttonText}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
            <h2 className="text-2xl font-semibold text-gray-700">Đang tải bảng giá...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
            <StarIcon /> BẢNG GIÁ DỊCH VỤ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Chọn gói phù hợp với nhu cầu của bạn. Tất cả gói đều bao gồm hỗ trợ 24/7 và cập nhật thường xuyên.
          </p>

          {/* User Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <VideoIcon />
                <span className="ml-2">Gói đăng bài</span>
              </h3>
              {currentSubs?.video_subscription ? (
                <>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {currentSubs.video_subscription.subscription_plan?.name || 'Không xác định'}
                  </p>
                  <span className={`text-sm ${currentSubs.video_subscription.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentSubs.video_subscription.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                  {currentSubs.video_subscription.end_date && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <CalendarIcon />
                      <span className="ml-2">
                        Còn lại: <span className="font-semibold text-blue-600">
                          {(() => {
                            const remainingDays = calculateRemainingDays(currentSubs.video_subscription.end_date);
                            return remainingDays !== null ? `${remainingDays} ngày` : 'Đang tính...';
                          })()}
                        </span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Chưa có gói</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <RobotIcon />
                <span className="ml-2">Gói Chatbot</span>
              </h3>
              {currentSubs?.chatbot_subscription ? (
                <>
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {currentSubs.chatbot_subscription.plan?.name || 'Không xác định'}
                  </p>
                  <span className={`text-sm ${currentSubs.chatbot_subscription.is_active ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentSubs.chatbot_subscription.is_active ? 'Đang hoạt động' : 'Chờ phê duyệt'}
                  </span>
                  {currentSubs.chatbot_subscription.end_date && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <CalendarIcon />
                      <span className="ml-2">
                        Còn lại: <span className="font-semibold text-blue-600">
                          {(() => {
                            const remainingDays = calculateRemainingDays(currentSubs.chatbot_subscription.end_date);
                            return remainingDays !== null ? `${remainingDays} ngày` : 'Đang tính...';
                          })()}
                        </span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Chưa có gói</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'video' 
                    ? 'text-purple-600 border-purple-600' 
                    : 'text-gray-500 border-transparent hover:text-purple-500'
                }`}
                onClick={() => setActiveTab('video')}
              >
                Gói Đăng Bài Video
              </button>
              <button
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'chatbot' 
                    ? 'text-purple-600 border-purple-600' 
                    : 'text-gray-500 border-transparent hover:text-purple-500'
                }`}
                onClick={() => setActiveTab('chatbot')}
              >
                Gói Chatbot
              </button>
            </div>

            {/* Video Tab Content */}
            {activeTab === 'video' && (
              <div>
                <section className="mb-12">
                  <div className="flex justify-between items-center mb-8 flex-col md:flex-row">
                    <h2 className="text-3xl font-bold text-gray-900 relative pb-3 mb-4 md:mb-0 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-purple-600 after:rounded">
                      GÓI ĐĂNG BÀI VIDEO
                    </h2>
                    <p className="text-gray-600 max-w-md text-center md:text-left">
                      Tự động đăng video lên nhiều nền tảng mạng xã hội với lịch trình được thiết lập trước.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {videoPlans.map((plan) => {
                      const isPopular = plan.name === 'Cơ bản';
                      const isFree = plan.name === 'Miễn phí';
                      
                      return (
                        <div
                          key={plan.id}
                          className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative flex flex-col min-h-[600px] ${
                            isPopular ? 'ring-4 ring-pink-200' : ''
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute top-4 -right-8 bg-yellow-500 text-white px-8 py-1 text-sm font-bold rotate-45 shadow-lg">
                              Phổ biến nhất
                            </div>
                          )}
                          
                          {/* Header với chiều cao cố định */}
                          <div className={`p-6 text-white text-center h-48 flex flex-col justify-center ${
                            isFree ? 'bg-gradient-to-br from-green-500 to-green-400' :
                            isPopular ? 'bg-gradient-to-br from-pink-500 to-pink-400' :
                            'bg-gradient-to-br from-purple-500 to-purple-400'
                          }`}>
                            <div className="text-xl font-bold mb-2 leading-tight">{plan.name.toUpperCase()}</div>
                            <div className="text-3xl font-black mb-1 leading-tight">{formatPrice(plan.price)}</div>
                            <div className="text-white/90 mb-4 leading-tight">{formatDuration(plan)}</div>
                            
                            {plan.name === 'Tiết kiệm' && (
                              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                Tiết kiệm 16%
                              </div>
                            )}
                            
                            {plan.name === 'Chuyên nghiệp' && (
                              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                Tặng 6 tháng sử dụng
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="p-6 flex-1">
                            <div className="space-y-4">
                              <div className="flex items-center pb-3 border-b border-gray-100">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                  <VideoIcon />
                                </div>
                                <div>{plan.max_videos_per_day} video/ngày</div>
                              </div>
                              
                              <div className="flex items-center pb-3 border-b border-gray-100">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                  <CalendarIcon />
                                </div>
                                <div>Lên lịch trước {plan.max_scheduled_days} ngày</div>
                              </div>
                              
                              <div className="flex items-center pb-3 border-b border-gray-100">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                  <SaveIcon />
                                </div>
                                <div>{plan.max_stored_videos} video lưu trữ</div>
                              </div>
                              
                              <div className="flex items-center pb-3 border-b border-gray-100">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                  <UsersIcon />
                                </div>
                                <div>{plan.max_social_accounts} tài khoản MXH</div>
                              </div>
                              
                              {plan.ai_content_generation && (
                                <div className="flex items-center">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                    <RobotIcon />
                                  </div>
                                  <div>Hỗ trợ AI viết nội dung</div>
                                </div>
                              )}

                              {plan.storage_limit_gb > 10 && (
                                <div className="flex items-center">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                    <CloudIcon />
                                  </div>
                                  <div>Lưu trữ đám mây nâng cao</div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Footer với nút đăng ký */}
                          <div className="p-6 pt-0 mt-auto">
                            {renderSubscribeButton(plan, isFree)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Comparison Table */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ChartBarIcon />
                        <span className="ml-2">So Sánh Chi Tiết Các Gói Đăng Bài</span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-left font-semibold text-gray-900 border-r border-gray-200 min-w-[200px]">TÍNH NĂNG</th>
                            {videoPlans.map((plan) => (
                              <th key={plan.id} className="p-4 text-center font-semibold text-gray-900">
                                {plan.name.toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {videoFeatureRows.map((feature, index) => (
                            <tr 
                              key={index} 
                              className={`border-b border-gray-100 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-purple-50 transition-colors`}
                            >
                              <td className="p-4 text-left font-medium text-gray-900 border-r border-gray-200">
                                <div>
                                  {feature.name}
                                  {feature.note && (
                                    <div className="text-xs text-gray-500 italic mt-1">{feature.note}</div>
                                  )}
                                </div>
                              </td>
                              {videoPlans.map((plan) => (
                                <td key={plan.id} className="p-4 text-center">
                                  {renderFeatureValue(feature.getValue(plan))}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Chatbot Tab Content */}
            {activeTab === 'chatbot' && (
              <div>
                <section className="mb-12">
                  <div className="flex justify-between items-center mb-8 flex-col md:flex-row">
                    <h2 className="text-3xl font-bold text-gray-900 relative pb-3 mb-4 md:mb-0 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-purple-600 after:rounded">
                      GÓI CHATBOT
                    </h2>
                    <p className="text-gray-600 max-w-md text-center md:text-left">
                      Chatbot thông minh được thiết kế riêng cho từng ngành nghề, giúp tự động hóa dịch vụ chăm sóc khách hàng.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {chatbotPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col min-h-[550px]"
                      >
                        {/* Header với chiều cao cố định */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-400 p-6 text-white text-center h-48 flex flex-col justify-center">
                          <div className="text-xl font-bold mb-2 leading-tight">{plan.name.toUpperCase()}</div>
                          <div className="text-3xl font-black mb-1 leading-tight">{formatPrice(plan.monthly_price)}</div>
                          <div className="text-white/90 leading-tight">/ tháng</div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="space-y-4 mb-6 flex-1">
                            <div className="flex items-center pb-3 border-b border-gray-100">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                <RobotIcon />
                              </div>
                              <div>{plan.description}</div>
                            </div>
                            
                            <div className="flex items-center pb-3 border-b border-gray-100">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                <PlugIcon />
                              </div>
                              <div>Tích hợp API</div>
                            </div>
                            
                            <div className="flex items-center pb-3 border-b border-gray-100">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                <CodeIcon />
                              </div>
                              <div>Script nhúng Website</div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-purple-600">
                                <ChartLineIcon />
                              </div>
                              <div className="flex items-center">
                                <span className="relative group">
                                  Phân tích cuộc trò chuyện
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs p-2 rounded opacity-0 pointer-events-none transition-opacity duration-300 w-48 group-hover:opacity-100">
                                    Tính năng đang phát triển, sẽ ra mắt sớm
                                  </span>
                                </span>
                                <span className="text-yellow-600 text-sm ml-2">(Sắp ra mắt)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Số tháng:</label>
                            <select 
                              value={selectedMonths} 
                              onChange={(e) => setSelectedMonths(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} tháng</option>)}
                            </select>
                          </div>
                          
                          {/* Footer với nút đăng ký */}
                          <div className="mt-auto">
                            {renderSubscribeButton(plan)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Comparison Table for Chatbot */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <ChartBarIcon />
                        <span className="ml-2">So Sánh Chi Tiết Các Gói Chatbot</span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-left font-semibold text-gray-900 border-r border-gray-200 min-w-[200px]">TÍNH NĂNG</th>
                            {chatbotPlans.map((plan) => (
                              <th key={plan.id} className="p-4 text-center font-semibold text-gray-900">
                                {plan.name.toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chatbotFeatureRows.map((feature, index) => (
                            <tr 
                              key={index} 
                              className={`border-b border-gray-100 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-purple-50 transition-colors`}
                            >
                              <td className="p-4 text-left font-medium text-gray-900 border-r border-gray-200">
                                {feature.name}
                              </td>
                              {chatbotPlans.map((plan) => (
                                <td key={plan.id} className="p-4 text-center">
                                  {renderFeatureValue(feature.getValue(plan))}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* QR Code Payment Modal */}
      {isQrModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">
              Thanh toán cho gói "{selectedPlan.name}" 
              {activeTab === 'chatbot' && ` (${selectedMonths} tháng)`}
            </h2>
            
            <img 
              src="/assets/qr-bank.jpg" 
              alt="Mã QR thanh toán" 
              className="mx-auto mb-4 w-64 h-64 object-contain rounded-lg border-4 border-gray-200"
              onError={(e) => { 
                e.currentTarget.src = 'https://placehold.co/256x256/e2e8f0/4a5568?text=QR+Lỗi'; 
                e.currentTarget.alt = 'Lỗi tải mã QR'; 
              }}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-lg font-semibold text-blue-600 mb-2">
                Số tiền: {activeTab === 'chatbot' && 'monthly_price' in selectedPlan 
                  ? formatPrice(selectedPlan.monthly_price * selectedMonths)
                  : formatPrice('price' in selectedPlan ? selectedPlan.price : 0)
                }
              </p>
              <p className="text-gray-700">
                Nội dung chuyển khoản: <br/>
                <strong className="text-red-600 bg-red-100 px-2 py-1 rounded text-sm">
                  {activeTab === 'chatbot' ? 'CHATBOT_' : ''}[SỐ ĐIỆN THOẠI CỦA BẠN]
                </strong>
              </p>
            </div>
            
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold w-full"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
