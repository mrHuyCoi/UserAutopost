// src/components/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Auto collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems: SidebarItem[] = [
    { 
      id: 'components', 
      label: 'Linh kiện', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7.5 4.27 9 5.15"></path>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
      ), 
      path: '/components',
    },
    { 
      id: 'devices', 
      label: 'Điện thoại', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
          <path d="M12 18h.01"></path>
        </svg>
      ), 
      path: '/devices' 
    },
    { 
      id: 'services', 
      label: 'Dịch vụ', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ), 
      path: '/services',
    },
    { 
      id: 'chatbot', 
      label: 'Chatbot', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ), 
      path: '/chatbot' 
    },
    { 
      id: 'channels', 
      label: 'Kênh kết nối', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 20h4"></path>
          <path d="M6 9l6-7 6 7"></path>
          <path d="M12 16v4"></path>
          <path d="M8 12h8"></path>
          <path d="M4 20h16"></path>
        </svg>
      ), 
      path: '/channels' 
    },
    { 
      id: 'settings', 
      label: 'Cài đặt', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ), 
      path: '/settings' 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar bg-white border-r border-gray-200 flex flex-col transition-all duration-300 fixed md:relative z-50 h-full ${
          isSidebarCollapsed ? 'w-14 md:w-16' : 'w-64'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header - Đơn giản hóa */}
        <div className={`sidebar-header p-3 border-b border-gray-200 flex items-center ${
          isSidebarCollapsed ? 'justify-center' : 'justify-start'
        }`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                CB
              </div>
              <h2 className="text-base font-bold text-gray-900">Chatbot</h2>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              CB
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 overflow-y-auto p-2 space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            return (
              <div
                key={item.id}
                className={`nav-item group relative flex items-center justify-between px-2 py-2 rounded-lg transition-all ${
                  active
                    ? 'active bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Link
                  to={item.path}
                  className={`nav-item-content flex items-center gap-2 flex-1 ${
                    isSidebarCollapsed ? 'justify-center' : ''
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className={`nav-icon ${active ? 'text-blue-600' : 'text-gray-400'} group-hover:text-blue-500`}>
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="nav-text text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
                
                {/* Badge */}
                {!isSidebarCollapsed && item.badge && (
                  <span className="nav-badge bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full min-w-6 text-center flex-shrink-0">
                    {item.badge > 999 ? '999+' : item.badge}
                  </span>
                )}
                
                {/* Tooltip for collapsed sidebar */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                    {item.label}
                    {item.badge && (
                      <span className="ml-1 bg-blue-500 text-white px-1 rounded text-xs">
                        {item.badge > 999 ? '999+' : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            <div className={`transform transition-transform ${
              isSidebarCollapsed ? 'rotate-180' : ''
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">Thu gọn</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0 transition-all duration-300">
        {/* Mobile Header - Đơn giản hóa, chỉ hiển thị menu button và title */}
        <div className="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-base font-semibold text-gray-900 truncate px-2">
            {sidebarItems.find(item => isActive(item.path))?.label || 'Chatbot'}
          </h1>
          
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 md:p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;