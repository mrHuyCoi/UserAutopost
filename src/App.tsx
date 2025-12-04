// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SolutionPage } from './pages/SolutionPage';
import { PostsPage } from './pages/PostsPage';
import { AccountsPage } from './pages/AccountsPage';
import { PricingPage } from './pages/PricingPage';
import { VideoPage } from './pages/VideoPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { LoginCallbackPage } from './pages/LoginCallbackPage';
import { usePlatforms } from './hooks/usePlatforms';
import { usePosts } from './hooks/usePosts';
import { useAuth } from './hooks/useAuth';
import ApiIntegrationPage from './pages/ApiIntegrationPage';

import { ZaloButton } from './components/ZaloButton';
import ServiceManagement from './components/ServiceManagement/ServiceManagement';
import ChatbotManagement from './components/ChatbotManagement';
import ComponentManagement from './components/ComponentManagement/ComponentManagement';
import DeviceManagement from './components/DeviceManagerment/DeviceManagement';
import ChannelManagement from './components/ChannelManagement/ChannelManagement';
import Header from './components/Header';

// Sửa import MainLayout - import default
import MainLayout from './components/MainLayout';
import SettingsManagement from './components/SettingManagement';
import ChatBot from './components/ChatBot';
import SyncPage from './pages/SyncPage';

function App() {
  const { 
    platforms, 
    accounts, 
    savedAccounts,
    isLoadingAccounts,
    getAccountsByPlatform,
    getSavedAccountsByPlatform,
    getSocialAccountId,
    loadSavedAccounts,
    removeAccountFromState,
  } = usePlatforms();
  
  const { 
    publishedPosts, 
    unpublishedPosts, 
    isLoadingPublished, 
    isLoadingUnpublished, 
    refreshPosts,
    updatePost,
    deletePost,
    retryPost
  } = usePosts();
  
  const { isLoading } = useAuth();
  
  const location = useLocation();
  const showChatButtons = !location.pathname.startsWith('/chatbot-tabs');

  // Only server accounts now
  const connectedAccounts = accounts.filter(acc => acc.connected);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        connectedCount={connectedAccounts.length}
        totalPosts={publishedPosts.length + unpublishedPosts.length}
      />

      <Routes>
        {/* Public routes - không có sidebar */}
        <Route path="/" element={<HomePage />} />
        <Route path="/solution" element={<SolutionPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login/callback" element={<LoginCallbackPage />} />
        
        {/* Protected routes với sidebar layout */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ServiceManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/chatbot" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChatbotManagement />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/components" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComponentManagement />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot/sync" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <SyncPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/devices" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeviceManagement />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route
          path='/channels'
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChannelManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
        <Route
          path='/settings'
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
        {/* Các route khác giữ nguyên */} 
        <Route 
          path="/posts" 
          element={
            <ProtectedRoute>
              <PostsPage
                // accounts={accounts}
                // publishedPosts={publishedPosts}
                // unpublishedPosts={unpublishedPosts}
                // isLoadingPublished={isLoadingPublished}
                // isLoadingUnpublished={isLoadingUnpublished}
                // getSocialAccountId={getSocialAccountId}
                // onRefreshPosts={refreshPosts}
                // onUpdatePost={updatePost}
                // onDeletePost={deletePost}
                // onRetryPost={retryPost}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/accounts" 
          element={
            <ProtectedRoute>
              <AccountsPage
                platforms={platforms}
                accounts={accounts}
                savedAccounts={savedAccounts}
                isLoadingAccounts={isLoadingAccounts}
                getAccountsByPlatform={getAccountsByPlatform}
                getSavedAccountsByPlatform={getSavedAccountsByPlatform}
                onReloadAccounts={(platformId) => loadSavedAccounts(platformId)}
                onAccountDeleted={removeAccountFromState}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/video" 
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/integration" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ApiIntegrationPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot-tabs" 
          element={
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          } 
        />
        
        {/* Thêm các route mới cho sidebar */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Người dùng</h1>
                  <p>Nội dung quản lý người dùng sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/packages" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Gói đăng bài</h1>
                  <p>Nội dung quản lý gói đăng bài sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/registrations" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Đăng ký mới</h1>
                  <p>Nội dung đăng ký mới sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/colors" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Màu sắc</h1>
                  <p>Nội dung quản lý màu sắc sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/storage" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Dung lượng</h1>
                  <p>Nội dung quản lý dung lượng sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/brands" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý Thương hiệu</h1>
                  <p>Nội dung quản lý thương hiệu sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Thống kê & Báo cáo</h1>
                  <p>Nội dung thống kê sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/support" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Hỗ trợ & Trợ giúp</h1>
                  <p>Nội dung hỗ trợ sẽ được thêm sau...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {showChatButtons && <ZaloButton />}
      {showChatButtons && <ChatBot />}
    </div>
  );
}

export default App;