'use client';

import { Settings, LogOut, User, Bell } from 'lucide-react';

interface NavbarProps {
  lang: 'ko' | 'en';
  setLang: (lang: 'ko' | 'en') => void;
}

const Navbar = ({ lang, setLang }: NavbarProps) => {
  return (
    <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
      {/* Left - Logo */}
      <div className="flex items-center">
        <span className="text-white font-semibold">Farmers_Mind</span>
        <span className="text-[#3fb950] font-semibold ml-2">PoC (Ver.1.0.0)</span>
      </div>

      {/* Right - User & Actions */}
      <div className="flex items-center gap-4">
        {/* Language, Notifications, Settings Group */}
        <div className="flex items-center gap-1">
          {/* Language Switch */}
          <div className="flex items-center border border-[#30363d]">
            <span
              className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition-all ${lang === 'ko' ? 'text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setLang('ko')}
            >
              KO
            </span>
            <span className="text-gray-600">|</span>
            <span
              className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition-all ${lang === 'en' ? 'text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setLang('en')}
            >
              EN
            </span>
          </div>

          {/* Notifications */}
          <button className="ml-2 p-2 text-gray-400 hover:text-gray-200 hover:bg-[#21262d] rounded transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#21262d] rounded transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#30363d]" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#21262d] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-sm">
            <p className="text-gray-200">C.P.Group</p>
            <p className="text-gray-500 text-xs">ChampaHomFarm</p>
          </div>
        </div>

        {/* Logout */}
        <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
