import React from 'react';
import { Bell, User, Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: string;
}

const roleColors: Record<string, string> = {
  head: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  normal: 'bg-green-100 text-green-800',
  view: 'bg-gray-100 text-gray-800'
};

export function Header({ onMenuClick, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 bg-[#1a2234] border-b border-gray-700 flex items-center justify-between px-3 sm:px-4 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="text-gray-300 hover:text-white lg:hidden p-1 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-white font-semibold hidden sm:block capitalize">{currentPage}</h2>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="relative group">
          <button 
            className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            {user && (
              <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                <Shield className="h-3 w-3" />
                {user.role}
              </span>
            )}
          </button>
          
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
            {user && (
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
                {user.department && (
                  <div className="text-sm text-gray-500">{user.department}</div>
                )}
              </div>
            )}
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}