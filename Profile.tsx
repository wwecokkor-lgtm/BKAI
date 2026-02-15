import React from 'react';
import { useAuth } from './AuthContext';
import { LogOut, Settings, Mail, BookOpen } from 'lucide-react';
import { SubscriptionType } from './types';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = user.displayName || 'Student';
  const initial = displayName.charAt(0) || 'S';

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8 pt-4">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-white shadow-xl">
          {initial}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
        <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" /> {user.email}
        </p>
        <div className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {user.classLevel}
        </div>
      </div>

      {/* Stats - Simplified */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-800">{user.dailyUsage}</div>
          <div className="text-xs text-slate-500">Today's Solves</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-800 flex justify-center items-center gap-2">
             <BookOpen className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-xs text-slate-500">Active Student</div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 transition group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition">
              <Settings className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
            </div>
            <span className="font-medium text-slate-700">Account Settings</span>
          </div>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-medium text-red-600">Sign Out</span>
          </div>
        </button>
      </div>

      <div className="text-center text-xs text-slate-300 mt-8">
        BK Academy v2.1 • Free & Unlimited
      </div>
    </div>
  );
};