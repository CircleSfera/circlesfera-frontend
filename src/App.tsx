import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { lazy, Suspense } from 'react';

// Auth routes
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Page routes
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
const Explore = lazy(() => import('./pages/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const TagFeed = lazy(() => import('./pages/TagFeed'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Admin = lazy(() => import('./pages/Admin'));
const Frames = lazy(() => import('./pages/Frames'));
const Saved = lazy(() => import('./pages/Saved'));

// Layouts and components (Keeping some commonly used ones or those that define structure)
import ChatLayout from './layouts/ChatLayout';
import ChatWindow from './components/chat/ChatWindow';
import SelectChat from './components/chat/SelectChat';
import CreatePostModal from './components/CreatePostModal';
import LayoutWrapper from './layouts/LayoutWrapper';
import CsrfInitializer from './components/CsrfInitializer';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Component to redirect /profile to current user's profile
function ProfileRedirect() {
  const profile = useAuthStore((state) => state.profile);
  
  if (!profile?.username) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to={`/${profile.username}`} replace />;
}

// Helper to redirect /profile/:username to /:username
function RedirectToProfile() {
  const { username } = useParams<{ username: string }>();
  return <Navigate to={`/${username}`} replace />;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <LayoutWrapper>
      <CsrfInitializer />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Auth routes */}
          <Route path="/accounts/login" element={<Login />} />
          <Route path="/accounts/emailsignup" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* ... (static redirects remain same) */}
        
        {/* Home feed or Landing Page based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            ) : (
              <LandingPage />
            )
          }
        />
        
        {/* Explore */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        
        {/* Create post - Instagram opens modal, we keep as route for now */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePostModal />
            </ProtectedRoute>
          }
        />
        
        {/* Tags - Instagram style: /explore/tags/:tag */}
        <Route
          path="/explore/tags/:tag"
          element={
            <ProtectedRoute>
              <TagFeed />
            </ProtectedRoute>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/tags/:tag" element={<Navigate to="/explore/tags/:tag" replace />} />
        
        {/* Post detail - Instagram style: /p/:id */}
        <Route
          path="/p/:id"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/post/:id" element={<Navigate to="/p/:id" replace />} />
        
        {/* Direct messages - Instagram style: /direct/inbox */}
        <Route
          path="/direct/inbox"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SelectChat />} />
          <Route path="t/:id" element={<ChatWindow />} />
        </Route>
        {/* Keep old routes for compatibility */}
        <Route path="/messages" element={<Navigate to="/direct/inbox" replace />} />
        <Route path="/messages/:id" element={<Navigate to="/direct/inbox/t/:id" replace />} />
        
        {/* Settings - Instagram style: /accounts/edit */}
        <Route
          path="/accounts/edit"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/settings" element={<Navigate to="/accounts/edit" replace />} />
        
        {/* Profile redirect - redirects /profile to /:username */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              {/* Use a function component to access params and redirect dynamically */}
              <RedirectToProfile />
            </ProtectedRoute>
          }
        />
        



        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Notifications / Activity */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Frames (Reels) */}
        <Route
          path="/frames"
          element={
            <ProtectedRoute>
              <Frames />
            </ProtectedRoute>
          }
        />

        {/* Saved posts */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />

        {/* User profile - Instagram style: /:username (MUST be last to avoid conflicts) */}
        <Route
          path="/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </LayoutWrapper>
  );
}

export default App;
