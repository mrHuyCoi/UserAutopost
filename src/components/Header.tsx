import React from 'react';
import { 
  Home, DollarSign, Send, LogOut, 
  Lightbulb, Video, Menu, X, Bot, Building2
} from 'lucide-react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Swal from 'sweetalert2';
import autopostLogo from '../assets/autopost.png';

interface HeaderProps {
  connectedCount?: number;
  totalPosts?: number;
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    if (path === '/chatbot-tabs/chat')
      return location.pathname.startsWith('/chatbot-tabs/chat') && !location.pathname.includes('linhkien');
    if (path === '/chatbot-tabs/chatbot-linhkien')
      return location.pathname.startsWith('/chatbot-tabs/chatbot-linhkien');
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    });

    if (isConfirmed) {
      logout();
      setTimeout(() => (window.location.href = '/'), 300);
    }
  };

  React.useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isMenuOpen]);

  // Navigation links for desktop
  const desktopNavLinks = (
    <>
      <Link
        to="/"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Home size={16} /> Trang Chủ
      </Link>
      <Link
        to="/solution"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/solution') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Lightbulb size={16} /> Giải Pháp
      </Link>
      <Link
        to="/pricing"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive('/pricing') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <DollarSign size={16} /> Bảng Giá
      </Link>
      {isAuthenticated && (
        <div className="hidden lg:flex items-center space-x-2">
          <Link
            to="/video"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/video') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Video size={16} /> Tạo Video
          </Link>
          <Link
            to="/posts"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/posts') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Send size={16} /> Đăng Bài
          </Link>
          <Link
            to="/chatbot"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/chatbot-tabs') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bot size={16} /> Chatbot
          </Link>
        </div>
      )}
    </>
  );

  // Navigation links for mobile/tablet
  const mobileNavLinks = (
    <div className="space-y-1 pt-4 pb-4 border-t border-gray-200">
      <Link
        to="/"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <Home size={18} /> Trang Chủ
      </Link>
      <Link
        to="/solution"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive('/solution') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <Lightbulb size={18} /> Giải Pháp
      </Link>
      <Link
        to="/pricing"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive('/pricing') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <DollarSign size={18} /> Bảng Giá
      </Link>
      
      {isAuthenticated && (
        <>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Công Cụ
          </div>
          <Link
            to="/video"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/video') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Video size={18} /> Tạo Video
          </Link>
          <Link
            to="/posts"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/posts') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Send size={18} /> Đăng Bài
          </Link>
          <Link
            to="/chatbot"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/chatbot-tabs') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Bot size={18} /> Chatbot
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={autopostLogo}
              alt="AutoPost"
              className="w-8 h-8 object-cover rounded"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">AutoPost</h1>
              <p className="text-xs text-gray-500">Đăng bài tự động</p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex flex-grow items-center justify-center space-x-1 lg:space-x-2">
            {desktopNavLinks}
          </nav>

          {/* User Info - Desktop */}
          <div className="hidden md:flex items-center flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-3">
                {/* User Info Text */}
                <div className="flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                    {user?.full_name || 'Người dùng'}
                  </p>
                  {user?.role && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mt-0.5">
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Avatar */}
                <div className="relative profile-menu-container">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.full_name || 'Người dùng'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                        {user?.role && (
                          <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            {user.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <NavLink
                        to="/accounts"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Building2 size={16} /> Tài khoản
                      </NavLink>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-md"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors mobile-menu-container"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Menu Slide-in */}
      <div className={`
        md:hidden fixed top-0 right-0 h-full w-72 max-w-full bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out mobile-menu-container
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src={autopostLogo}
                alt="AutoPost"
                className="w-8 h-8 object-cover rounded"
              />
              <div>
                <h1 className="text-base font-bold text-gray-900">AutoPost</h1>
                <p className="text-xs text-gray-500">Đăng bài tự động</p>
              </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {mobileNavLinks}
            
            {/* User Section in Mobile Menu */}
            {isAuthenticated && (
              <div className="px-3 py-3 border-t border-gray-200 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.full_name || 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <NavLink
                  to="/accounts"
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mb-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building2 size={16} /> Tài khoản
                </NavLink>
                
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;