import React from 'react';
import {
  LayoutDashboard,
  Settings,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  DoorOpen,
  CalendarDays,
  FileCheck,
  ClipboardList,
  FileBarChart2,
  History,
  Sparkles,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Role } from '../../types';

export type NavItemKey =
  | 'dashboard'
  | 'settings'
  | 'students'
  | 'classes'
  | 'supervisors'
  | 'subjects'
  | 'rooms'
  | 'schedules'
  | 'minutes'
  | 'attendance'
  | 'makeup'
  | 'reports'
  | 'audit';

interface MenuItem {
  key: NavItemKey;
  label: string;
  shortLabel?: string;
  icon: any;
  roles: string[];
  badge?: string;
  highlight?: boolean;
}

export interface SidebarProps {
  currentView?: string;
  currentTab?: NavItemKey;
  onNavigate?: (tab: NavItemKey) => void;
  onSelectTab?: (tab: NavItemKey) => void;
  userRole: Role;
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDocModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentTab: currentTabProp,
  onNavigate,
  onSelectTab: onSelectTabProp,
  userRole,
  isOpen,
  isMobileOpen,
  onClose: onCloseProp,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onOpenDocModal
}) => {
  const currentTab = (currentView || currentTabProp || 'dashboard') as NavItemKey;
  const onSelectTab = onNavigate || onSelectTabProp || (() => {});
  const onClose = onCloseMobile || onCloseProp || (() => {});
  const showMobile = isMobileOpen ?? isOpen ?? false;

  const menuGroups: { title: string; items: MenuItem[] }[] = [
    {
      title: 'UTAMA',
      items: [
        {
          key: 'dashboard' as NavItemKey,
          label: '1. Dashboard',
          shortLabel: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS']
        },
        {
          key: 'settings' as NavItemKey,
          label: '2. Pengaturan Umum',
          shortLabel: 'Pengaturan',
          icon: Settings,
          roles: ['ADMIN', 'PANITIA']
        }
      ]
    },
    {
      title: 'DATA MASTER',
      items: [
        {
          key: 'students' as NavItemKey,
          label: '3. Data Siswa',
          shortLabel: 'Siswa',
          icon: Users,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        },
        {
          key: 'classes' as NavItemKey,
          label: '4. Data Kelas',
          shortLabel: 'Kelas',
          icon: GraduationCap,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        },
        {
          key: 'supervisors' as NavItemKey,
          label: '5. Data Pengawas',
          shortLabel: 'Pengawas',
          icon: UserCheck,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        },
        {
          key: 'subjects' as NavItemKey,
          label: '6. Data Mata Pelajaran',
          shortLabel: 'Mapel',
          icon: BookOpen,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        },
        {
          key: 'rooms' as NavItemKey,
          label: '7. Master Ruang',
          shortLabel: 'Ruang',
          icon: DoorOpen,
          badge: 'Master',
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        }
      ]
    },
    {
      title: 'PELAKSANAAN UJIAN',
      items: [
        {
          key: 'schedules' as NavItemKey,
          label: '8. Pengaturan Jadwal',
          shortLabel: 'Jadwal',
          icon: CalendarDays,
          highlight: true,
          badge: 'Multi-Kelas',
          roles: ['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS']
        },
        {
          key: 'attendance' as NavItemKey,
          label: '9. Daftar Hadir',
          shortLabel: 'Presensi',
          icon: ClipboardList,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS']
        },
        {
          key: 'minutes' as NavItemKey,
          label: '10. Berita Acara',
          shortLabel: 'Berita Acara',
          icon: FileCheck,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS']
        },
        {
          key: 'makeup' as NavItemKey,
          label: '11. Daftar Siswa Susulan',
          shortLabel: 'Susulan',
          icon: RotateCcw,
          badge: 'Susulan',
          roles: ['ADMIN', 'PANITIA', 'OPERATOR', 'PENGAWAS']
        }
      ]
    },
    {
      title: 'LAPORAN & SISTEM',
      items: [
        {
          key: 'reports' as NavItemKey,
          label: '12. Laporan & Cetak',
          shortLabel: 'Laporan',
          icon: FileBarChart2,
          roles: ['ADMIN', 'PANITIA', 'OPERATOR']
        },
        {
          key: 'audit' as NavItemKey,
          label: '13. Audit Log & Backup',
          shortLabel: 'Audit Log',
          icon: History,
          roles: ['ADMIN', 'PANITIA']
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {showMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:relative top-0 md:top-auto left-0 h-full bg-slate-900 text-slate-200 z-50 md:z-20
          flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0
          ${
            showMobile
              ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl'
              : '-translate-x-full md:translate-x-0'
          }
          ${isCollapsed ? 'md:w-20' : 'md:w-64 xl:w-72 2xl:w-76'}
        `}
      >
        {/* Brand Header */}
        <div className="h-14 px-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div
              className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Klik untuk memperluas sidebar' : 'ADMIN UJIAN'}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden min-w-0">
                <h2 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                  ADMIN UJIAN
                </h2>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  Sistem Terpadu Sekolah
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle in Header */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${
                isCollapsed ? 'hidden' : ''
              }`}
              title="Perkecil sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 custom-scrollbar">
          {menuGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) =>
              item.roles.includes(userRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {/* Group Title or Divider */}
                {!isCollapsed ? (
                  <p className="px-3 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </p>
                ) : (
                  <div className="my-2 border-t border-slate-800/80" />
                )}

                {/* Items */}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;

                  return (
                    <div key={item.key} className="relative group">
                      <button
                        onClick={() => {
                          onSelectTab(item.key);
                          onClose();
                        }}
                        className={`
                          w-full flex items-center rounded-lg font-medium transition-all cursor-pointer
                          ${
                            isCollapsed
                              ? 'justify-center p-2.5'
                              : 'justify-between px-3 py-2 text-xs'
                          }
                          ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                              : item.highlight
                              ? 'bg-slate-800/80 text-blue-300 hover:bg-slate-800 hover:text-white border border-blue-900/40'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                        title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-white'
                                : item.highlight
                                ? 'text-blue-400'
                                : 'text-slate-400 group-hover:text-white'
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {/* Badges in Expanded mode */}
                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-1.5 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed dot badge for special items */}
                        {isCollapsed && item.badge && !isActive && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900" />
                        )}
                      </button>

                      {/* Tooltip on Desktop when Collapsed */}
                      {isCollapsed && (
                        <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 items-center pointer-events-none">
                          <div className="px-3 py-1.5 bg-slate-950 text-white rounded-md text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in zoom-in-95">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Info & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-slate-400 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-300">Versi 1.0.0 Relasional</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Aktif</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-500 truncate">
                  Multi-Kelas/Mapel per Ruang
                </p>
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Perkecil menu sidebar"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Lipat</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Sistem Aktif" />
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Perluas Menu Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

