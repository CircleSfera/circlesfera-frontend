import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Auth routes
import Login from './pages/Login';
import Admin from './pages/Admin';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Page routes
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import TagFeed from './pages/TagFeed';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Frames from './pages/Frames';
import Saved from './pages/Saved';

// Layouts and components
import ChatLayout from './layouts/ChatLayout';
import ChatWindow from './components/chat/ChatWindow';
import SelectChat from './components/chat/SelectChat';
import CreatePostModal from './components/CreatePostModal';
import LayoutWrapper from './layouts/LayoutWrapper';

import AuthGuard from './components/auth/AuthGuard';
import GuestGuard from './components/auth/GuestGuard';

// Helper to redirect /profile to current user's profile

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
      <Routes>
          {/* Auth routes */}
          <Route path="/accounts/login" element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          } />
          <Route path="/accounts/emailsignup" element={
            <GuestGuard>
              <Register />
            </GuestGuard>
          } />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* ... (static redirects remain same) */}
        
        {/* Home feed or Landing Page based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AuthGuard>
                <Home />
              </AuthGuard>
            ) : (
              <LandingPage />
            )
          }
        />
        
        {/* Explore */}
        <Route
          path="/explore"
          element={
            <AuthGuard>
              <Explore />
            </AuthGuard>
          }
        />
        
        {/* Create post - Instagram opens modal, we keep as route for now */}
        <Route
          path="/create"
          element={
            <AuthGuard>
              <CreatePostModal />
            </AuthGuard>
          }
        />
        
        {/* Tags - Instagram style: /explore/tags/:tag */}
        <Route
          path="/explore/tags/:tag"
          element={
            <AuthGuard>
              <TagFeed />
            </AuthGuard>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/tags/:tag" element={<Navigate to="/explore/tags/:tag" replace />} />
        
        {/* Post detail - Instagram style: /p/:id */}
        <Route
          path="/p/:id"
          element={
            <AuthGuard>
              <PostDetail />
            </AuthGuard>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/post/:id" element={<Navigate to="/p/:id" replace />} />
        
        {/* Direct messages - Instagram style: /direct/inbox */}
        <Route
          path="/direct/inbox"
          element={
            <AuthGuard>
              <ChatLayout />
            </AuthGuard>
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
            <AuthGuard>
              <Settings />
            </AuthGuard>
          }
        />
        {/* Keep old route for compatibility */}
        <Route path="/settings" element={<Navigate to="/accounts/edit" replace />} />
        
        {/* Profile redirect - redirects /profile to /:username */}
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfileRedirect />
            </AuthGuard>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <AuthGuard>
              {/* Use a function component to access params and redirect dynamically */}
              <RedirectToProfile />
            </AuthGuard>
          }
        />
        
        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <Admin />
            </AuthGuard>
          }
        />

        {/* Notifications / Activity */}
        <Route
          path="/activity"
          element={
            <AuthGuard>
              <Notifications />
            </AuthGuard>
          }
        />

        {/* Frames (Reels) */}
        <Route
          path="/frames"
          element={
            <AuthGuard>
              <Frames />
            </AuthGuard>
          }
        />

        {/* Saved posts */}
        <Route
          path="/saved"
          element={
            <AuthGuard>
              <Saved />
            </AuthGuard>
          }
        />

        {/* User profile - Instagram style: /:username (MUST be last to avoid conflicts) */}
        <Route
          path="/:username"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
      </Routes>
    </LayoutWrapper>
  );
}

export default App;
