import React from 'react';
import { Home, BrainCircuit, History as HistoryIcon, User, ShieldCheck } from 'lucide-react';
import { UserRole } from './types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'solver' | 'history' | 'profile' | 'admin';
  onTabChange: (tab: any) => void;
  role: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, role }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 safe-area-bottom">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => onTabChange('dashboard')} 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'solver'} 
          onClick={() => onTabChange('solver')} 
          icon={<BrainCircuit className="w-6 h-6" />} 
          label="AI Tutor" 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => onTabChange('history')} 
          icon={<HistoryIcon className="w-6 h-6" />} 
          label="History" 
        />
        {role === UserRole.ADMIN && (
           <NavButton 
           active={activeTab === 'admin'} 
           onClick={() => onTabChange('admin')} 
           icon={<ShieldCheck className="w-6 h-6" />} 
           label="Admin" 
         />
        )}
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')} 
          icon={<User className="w-6 h-6" />} 
          label="Profile" 
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ${
      active ? 'text-indigo-600 bg-indigo-50 translate-y-[-4px] shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);