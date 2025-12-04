import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  Users, 
  Play, 
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
  Video,
  MessageCircle,
  Phone,
  Settings,
  Zap,
  Check,
  ShoppingCart,
  Mail,
  HelpCircle,
  FileText,
  BookOpen,
  Briefcase,
  Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleFreeTrialClick = () => {
    if (isAuthenticated) {
      navigate('/accounts');
    } else {
      navigate('/register');
    }
  };
  const features = [
    {
      icon: <Video className="text-white" size={24} />,
      title: "Tạo Video Tự Động",
      description: "Tạo video marketing chuyên nghiệp từ template có sẵn, tự động thêm logo, text và hiệu ứng."
    },
    {
      icon: <Share2 className="text-white" size={24} />,
      title: "Đăng Bài Tự Động",
      description: "Lên lịch và đăng bài tự động trên Facebook, Instagram, TikTok và các nền tảng khác."
    },
    {
      icon: <MessageCircle className="text-white" size={24} />,
      title: "Chatbot Thông Minh",
      description: "Chatbot AI tự động trả lời khách hàng 24/7, hỗ trợ bán hàng và chăm sóc khách hàng."
    },
    {
      icon: <Phone className="text-white" size={24} />,
      title: "Quản Lý Điện Thoại",
      description: "Quản lý danh sách điện thoại, phân loại khách hàng và tự động gửi tin nhắn marketing."
    },
    {
      icon: <Settings className="text-white" size={24} />,
      title: "Cài Đặt Linh Hoạt",
      description: "Tùy chỉnh mọi thông số theo nhu cầu doanh nghiệp, từ thời gian đăng bài đến nội dung."
    },
    {
      icon: <MessageCircle className="text-white" size={24} />,
      title: "Tích Hợp Messenger",
      description: "Kết nối với Facebook Messenger, Zalo để quản lý tin nhắn tập trung tại một nơi."
    }
  ];

  const pricingPlans = [
    {
      name: "Gói Chatbot",
      price: "599.000đ",
      period: "/tháng",
      features: [
        "5 tài khoản mạng xã hội",
        "100 bài đăng/tháng",
        "Chatbot cơ bản",
        "Hỗ trợ email"
      ],
      buttonVariant: "outline" as const
    },
    {
      name: "Gói Tự Động Đăng Bài",
      price: "1.299.000đ",
      period: "/tháng",
      features: [
        "Không giới hạn tài khoản",
        "Không giới hạn bài đăng",
        "Chatbot tùy chỉnh",
        "API tích hợp",
        "Quản lý nhóm"
      ],
      buttonVariant: "outline" as const
    }
  ];

  const stats = [
    { number: "50K+", label: "Đăng Bài Đã Tạo", icon: <Share2 size={20} /> },
    { number: "1M+", label: "Tương Tác Nhận Được", icon: <TrendingUp size={20} /> },
    { number: "99.9%", label: "Thời Gian Hoạt Động", icon: <Clock size={20} /> },
    { number: "24/7", label: "Hỗ Trợ Khách Hàng", icon: <Shield size={20} /> }
  ];

  const footerSections = [
    {
      title: "AutoPost",
      content: <p className="text-gray-300">Giải pháp tự động hóa đăng bài và quản lý khách hàng thông minh cho doanh nghiệp.</p>,
      links: []
    },
    {
      title: "Sản Phẩm",
      links: [
        { icon: <Video size={16} />, text: "Tạo Video", href: "/video" },
        { icon: <Share2 size={16} />, text: "Đăng Bài Tự Động", href: "/posts" },
        { icon: <MessageCircle size={16} />, text: "Chatbot", href: "/chatbot" },
        // { icon: <Users size={16} />, text: "Quản Lý Khách Hàng", href: "#" }
      ]
    },
    {
      title: "Hỗ Trợ",
      links: [
        { icon: <FileText size={16} />, text: "Hướng Dẫn", href: "https://hoangmaimobile.vn" },
        { icon: <Zap size={16} />, text: "API", href: "https://nguyen3g.com/api.php?module=shops&action=ListItem" },
        { icon: <Mail size={16} />, text: "Liên Hệ", href: "https://hoangmaimobile.vn/lien-he.html" }
      ]
    },
    {
      title: "Công Ty",
      links: [
        { icon: <Heart size={16} />, text: "Về Chúng Tôi", href: "https://hoangmaimobile.vn" },
        { icon: <BookOpen size={16} />, text: "Blog", href: "https://hoangmaimobile.vn" },
        { icon: <Briefcase size={16} />, text: "Tuyển Dụng", href: "https://hoangmaimobile.vn/tuyen-dung-dao-tao-kn4.html" },
        { icon: <Shield size={16} />, text: "Chính Sách", href: "https://hoangmaimobile.vn/chinh-sach-bao-mat-thong-tin-ct76.html" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Tự động hóa đăng bài số đông
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Giải pháp toàn diện giúp doanh nghiệp tự động hóa quy trình đăng bài, quản lý nội dung và tương tác khách hàng trên các nền tảng mạng xã hội.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleFreeTrialClick}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 shadow-lg hover:shadow-blue-200"
              >
                <Play size={20} />
                Miễn phí 14 ngày
              </button>
              
              <Link
                to="/pricing"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                <BarChart3 size={20} />
                Xem bảng giá
              </Link>
            </div>

            {/* Hero Features */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-gray-700">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-green-500" />
                <span className="font-medium">Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-green-500" />
                <span className="font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Giải Pháp Toàn Diện
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AutoPost cung cấp bộ công cụ hoàn chỉnh để tự động hóa marketing và quản lý khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
<section className="py-20 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Bảng Giá Linh Hoạt
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Chọn gói phù hợp với nhu cầu tự động hóa của doanh nghiệp bạn
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
      {pricingPlans.map((plan, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative border border-gray-200 flex flex-col h-full"
        >
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{plan.name}</h3>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3 text-gray-700">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto">
            <Link
              to={isAuthenticated ? "/pricing" : "/login"}
              className="w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <ShoppingCart size={20} />
              Chọn gói
            </Link>
          </div>
        </div>
      ))}
    </div>

    {/* Additional Info */}
    <div className="text-center mt-12">
      <p className="text-gray-600 mb-4">Tất cả các gói đều bao gồm:</p>
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          <span>Chatbot tự động trả lời</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          <span>Đăng bài đa nền tảng</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          <span>Hỗ trợ kỹ thuật</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          <span>Cập nhật miễn phí</span>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn Sàng Bắt Đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Tham gia cùng hàng nghìn doanh nghiệp đã tin tưởng AutoPost để tự động hóa marketing
          </p>
          
          <button
            onClick={handleFreeTrialClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 mx-auto w-fit"
          >
            <Zap size={20} />
            Dùng thử miễn phí
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-6">{section.title}</h3>
                {section.content && section.content}
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
                      >
                        {link.icon}
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 AutoPost. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};