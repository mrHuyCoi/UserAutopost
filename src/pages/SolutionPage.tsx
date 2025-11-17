import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle,
  ArrowRight,
  Layers,
  Calendar,
  Sparkles,
  PieChart,
  Store,
  Target,
  Paintbrush,
  Building,
  UserCheck,
  Rocket,
  Clock,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export const SolutionPage: React.FC = () => {
  // Features Data
  const features = [
    {
      icon: <Layers className="text-white" size={32} />,
      title: "Quản lý đa tài khoản",
      description: "Kết nối và quản lý không giới hạn tài khoản trên tất cả các nền tảng mạng xã hội phổ biến.",
      items: [
        "Kết nối không giới hạn tài khoản",
        "Đặt tên tùy chỉnh cho từng tài khoản",
        "Quản lý tập trung từ một dashboard",
        "Hỗ trợ tất cả nền tảng chính"
      ]
    },
    {
      icon: <Calendar className="text-white" size={32} />,
      title: "Lên lịch thông minh",
      description: "Lên lịch đăng bài tự động với thời gian tối ưu để tăng tương tác và tiếp cận.",
      items: [
        "Lên lịch đăng bài tự động",
        "Đề xuất thời gian tối ưu",
        "Đăng đồng thời nhiều nền tảng",
        "Theo dõi trạng thái real-time"
      ]
    },
    {
      icon: <Sparkles className="text-white" size={32} />,
      title: "AI tạo nội dung",
      description: "Sử dụng AI tiên tiến để tạo nội dung hấp dẫn, tối ưu cho từng nền tảng mạng xã hội.",
      items: [
        "Tạo nội dung bằng AI",
        "Tối ưu cho từng nền tảng",
        "Hashtag thông minh",
        "Đa dạng phong cách viết"
      ]
    },
    {
      icon: <PieChart className="text-white" size={32} />,
      title: "Phân tích & Báo cáo",
      description: "Theo dõi hiệu suất bài đăng với báo cáo chi tiết và insights để tối ưu chiến lược.",
      items: [
        "Báo cáo hiệu suất chi tiết",
        "Phân tích tương tác",
        "So sánh giữa các nền tảng",
        "Đề xuất cải thiện"
      ]
    }
  ];

  // Industries Data
  const industries = [
    {
      icon: <Store className="text-white" size={28} />,
      title: "E-commerce",
      description: "Quản lý nhiều shop, sản phẩm trên các nền tảng bán hàng và mạng xã hội"
    },
    {
      icon: <Target className="text-white" size={28} />,
      title: "Agency Marketing",
      description: "Quản lý tài khoản của nhiều khách hàng từ một dashboard duy nhất"
    },
    {
      icon: <Paintbrush className="text-white" size={28} />,
      title: "Content Creator",
      description: "Tối ưu hóa việc đăng content và tương tác với audience trên nhiều kênh"
    },
    {
      icon: <Building className="text-white" size={28} />,
      title: "Doanh nghiệp",
      description: "Xây dựng thương hiệu và tiếp cận khách hàng trên tất cả nền tảng"
    },
    {
      icon: <UserCheck className="text-white" size={28} />,
      title: "Influencer",
      description: "Quản lý personal brand và tối ưu engagement rate"
    },
    {
      icon: <Rocket className="text-white" size={28} />,
      title: "Startup",
      description: "Xây dựng presence online với ngân sách và nhân lực hạn chế"
    }
  ];

  // Benefits Data
  const benefits = [
    {
      icon: <Clock className="text-white" size={28} />,
      title: "Tiết kiệm thời gian",
      description: "Giảm 80% thời gian quản lý social media với tự động hóa thông minh"
    },
    {
      icon: <TrendingUp className="text-white" size={28} />,
      title: "Tăng hiệu quả",
      description: "Tăng 300% tương tác và reach nhờ AI tối ưu thời gian đăng bài"
    },
    {
      icon: <Shield className="text-white" size={28} />,
      title: "Bảo mật cao",
      description: "Mã hóa dữ liệu và lưu trữ an toàn, đảm bảo thông tin khách hàng"
    },
    {
      icon: <Zap className="text-white" size={28} />,
      title: "Dễ sử dụng",
      description: "Giao diện thân thiện, không cần kỹ thuật, dễ dàng làm chủ"
    }
  ];

  // Process Steps
  const processSteps = [
    {
      step: "01",
      title: "Tư vấn & Phân tích",
      description: "Phân tích nhu cầu và đề xuất giải pháp phù hợp với mục tiêu của bạn"
    },
    {
      step: "02",
      title: "Setup & Kết nối",
      description: "Thiết lập tài khoản và kết nối các nền tảng mạng xã hội của bạn"
    },
    {
      step: "03",
      title: "Training & Hướng dẫn",
      description: "Đào tạo sử dụng và tối ưu hóa workflow cho đội ngũ của bạn"
    },
    {
      step: "04",
      title: "Vận hành & Hỗ trợ",
      description: "Hỗ trợ 24/7 và tối ưu hóa liên tục để đạt kết quả tốt nhất"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Giải pháp Social Media toàn diện
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-95">
              Từ quản lý đa tài khoản đến AI tạo nội dung, chúng tôi cung cấp mọi công cụ bạn cần để thành công trên mạng xã hội.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/posts"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                Khám phá giải pháp
                <ArrowRight size={20} />
              </Link>
              <a
                href="https://zalo.me/0888822522"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                Tư vấn miễn phí
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Giải pháp chuyên nghiệp
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bộ công cụ hoàn chỉnh để quản lý và phát triển sự hiện diện trên mạng xã hội của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{feature.description}</p>
                
                <div className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Phù hợp cho mọi ngành nghề
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ cá nhân đến doanh nghiệp lớn, giải pháp của chúng tôi đáp ứng nhu cầu đa dạng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {industry.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.title}</h3>
                <p className="text-gray-600 leading-relaxed">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lợi ích vượt trội
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những lợi ích thiết thực mà khách hàng nhận được khi sử dụng AutoPost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Quy trình triển khai
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ setup đến vận hành, chúng tôi hỗ trợ bạn từng bước một cách chuyên nghiệp.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-20 right-20 h-1 bg-gray-300"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold border-8 border-gray-50 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng chuyển đổi chiến lược Social Media?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Liên hệ với chúng tôi để được tư vấn miễn phí và trải nghiệm demo sản phẩm.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://zalo.me/0888822522"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              Tư vấn miễn phí
            </a>
            
            <a
              href="https://www.youtube.com/watch?v=6_opEtIQlDM"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              Xem Demo
            </a>
          </div>
          
          <p className="text-blue-100 text-sm mt-6">
            Tư vấn miễn phí • Demo trực tiếp • Hỗ trợ 24/7
          </p>
        </div>
      </section>
    </div>
  );
};