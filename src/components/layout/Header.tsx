import React, { useState } from 'react';
import {
  Bell,
  UserCheck,
  LogOut,
  Shield,
  BookOpen,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { SchoolSetting, User, Role } from '../../types';

interface HeaderProps {
  settings: SchoolSetting;
  currentUser: User;
  onLogout?: () => void;
  onSwitchRole?: (role: Role) => void;
  onRoleChange?: (role: Role) => void;
  onOpenDoc?: () => void;
  onOpenDocModal?: () => void;
  onResetData?: () => void;
  conflictCount?: number;
  onOpenConflicts?: () => void;
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentUser,
  onLogout = () => {},
  onSwitchRole,
  onRoleChange,
  onOpenDoc,
  onOpenDocModal,
  onResetData = () => {},
  conflictCount = 0,
  onOpenConflicts = () => {},
  onToggleSidebar,
  onToggleMobileSidebar
}) => {
  const switchRole = onRoleChange || onSwitchRole || (() => {});
  const openDoc = onOpenDocModal || onOpenDoc || (() => {});
  const toggleMenu = onToggleMobileSidebar || onToggleSidebar || (() => {});
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PANITIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPERATOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENGAWAS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Menu Toggle & School Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            title="Buka / Tutup Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                {settings.schoolName}
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {settings.examName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                TP {settings.academicYear} • Semester {settings.semester}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2">
          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset ke data bawaan demo"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          {/* Architecture / ERD Documentation Modal Button */}
          <button
            onClick={openDoc}
            title="Lihat Arsitektur Sistem, ERD & Prisma"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Arsitektur &amp; ERD</span>
          </button>

          {/* Notification / Conflict Alert */}
          <button
            onClick={onOpenConflicts}
            className={`relative p-2 rounded-lg transition-colors ${
              conflictCount > 0
                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            title={conflictCount > 0 ? `${conflictCount} Perhatian Jadwal` : 'Tidak ada bentrok jadwal'}
          >
            {conflictCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {conflictCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
                {conflictCount}
              </span>
            )}
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {currentUser.fullName}
                </p>
                <span
                  className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 mt-0.5 rounded border ${getRoleBadge(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
              </div>
            </button>

            {/* Quick Role Switcher Dropdown */}
            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs text-slate-400">Masuk sebagai:</p>
                  <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500">@{currentUser.username}</p>
                </div>

                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ubah Role (Simulasi Hak Akses)
                </div>

                {(['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      {r}
                    </span>
                    {currentUser.role === r && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Sistem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
