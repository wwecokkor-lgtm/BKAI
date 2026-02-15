import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './Layout';
import { Login } from './Login';
import { Dashboard } from './Dashboard';
import { Solver } from './Solver';
import { History } from './History';
import { Profile } from './Profile';
import { Admin } from './Admin';
import { FounderPopup } from './FounderPopup'; // Import FounderPopup
import { Loader2 } from 'lucide-react';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'solver' | 'history' | 'profile' | 'admin'>('dashboard');

  // Guard against non-admins accessing admin tab via state manipulation
  useEffect(() => {
    if (activeTab === 'admin' && user?.role !== UserRole.ADMIN) {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // If user is banned/inactive (handled in AuthContext, but double check here)
  if (user.isActive === false) {
    return <Login />; // AuthContext logs them out, so this renders Login
  }

  return (
    <>
      <FounderPopup /> {/* Global Popup Injection */}
      <Layout activeTab={activeTab} onTabChange={setActiveTab} role={user.role}>
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'solver' && <Solver />}
        {activeTab === 'history' && <History />}
        {activeTab === 'profile' && <Profile />}
        {/* Strict Conditional Rendering for Admin Component */}
        {activeTab === 'admin' && user.role === UserRole.ADMIN && <Admin />}
      </Layout>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;