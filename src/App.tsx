import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sidebar,
  Header,
  DashboardView,
  StudentsView,
  ClassesView,
  RoomsView,
  SubjectsView,
  SupervisorsView,
  SettingsView,
  SchedulesView,
  ExamMinutesView,
  AttendanceView,
  MakeUpExamsView,
  ReportsView,
  AuditLogView,
  ArchitectureDocModal,
  Breadcrumbs
} from './components';
import { StorageService } from './lib/storage';
import {
  User,
  UserRole,
  Student,
  ClassItem,
  Room,
  Subject,
  Supervisor,
  ExamSchedule,
  ExamMinute,
  StudentAttendance,
  MakeUpExamRecord,
  SchoolSetting,
  AuditLog
} from './types';
import { Sparkles, Database, AlertTriangle } from 'lucide-react';

export default function App() {
  // State for all data models
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('exam_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Toggle sidebar for both mobile drawer and desktop collapse
  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('exam_admin_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  }, []);

  // Core Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [minutes, setMinutes] = useState<ExamMinute[]>([]);
  const [attendances, setAttendances] = useState<StudentAttendance[]>([]);
  const [makeUpExams, setMakeUpExams] = useState<MakeUpExamRecord[]>([]);
  const [settings, setSettings] = useState<SchoolSetting>(StorageService.getSettings());
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Function to refresh all state from StorageService
  const refreshAllData = useCallback(() => {
    setStudents(StorageService.getStudents());
    setClasses(StorageService.getClasses());
    setRooms(StorageService.getRooms());
    setSubjects(StorageService.getSubjects());
    setSupervisors(StorageService.getSupervisors());
    setSchedules(StorageService.getSchedules());
    setMinutes(StorageService.getExamMinutes());
    setAttendances(StorageService.getStudentAttendances());
    setMakeUpExams(StorageService.getMakeUpExams());
    setSettings(StorageService.getSettings());
    setLogs(StorageService.getAuditLogs());
  }, []);

  // Initialize data on mount
  useEffect(() => {
    StorageService.initStorage();
    refreshAllData();
  }, [refreshAllData]);

  // Role switch handler
  const handleRoleChange = (role: UserRole) => {
    const updated = StorageService.setCurrentUserRole(role);
    setCurrentUser(updated);

    // If supervisor tries to view admin-only settings, redirect to dashboard or schedules
    if (role === 'PENGAWAS' && ['settings', 'audit'].includes(currentView)) {
      setCurrentView('schedules');
    }
  };

  // Reset demo data handler
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset seluruh data ke data demo awal? Semua perubahan akan dikembalikan.')) {
      StorageService.resetToInitialData();
      refreshAllData();
      setCurrentView('dashboard');
    }
  };

  // Real-time conflict count across all schedules
  const conflictCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];
        if (a.date === b.date && a.roomId === b.roomId) {
          const overlap = a.startTime < b.endTime && a.endTime > b.startTime;
          if (overlap) count++;
        }
      }
    }
    return count;
  }, [schedules]);

  // Breadcrumb generation
  const breadcrumbItems = useMemo(() => {
    const viewLabels: Record<string, string> = {
      dashboard: 'Dashboard',
      schedules: 'Jadwal Ujian',
      students: 'Data Siswa',
      classes: 'Data Kelas',
      rooms: 'Data Ruang Ujian',
      subjects: 'Data Mata Pelajaran',
      supervisors: 'Data Pengawas',
      minutes: 'Berita Acara Ujian',
      attendance: 'Daftar Hadir',
      makeup: 'Daftar Siswa Susulan',
      reports: 'Laporan & Cetak',
      audit: 'Audit Log & Backup',
      settings: 'Pengaturan Sekolah'
    };

    if (currentView === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }
    return [
      { label: 'Administrasi Ujian', onClick: () => setCurrentView('dashboard') },
      { label: viewLabels[currentView] || currentView }
    ];
  }, [currentView]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col antialiased text-slate-800 overflow-hidden">
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        settings={settings}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        conflictCount={conflictCount}
        onOpenDocModal={() => setIsDocModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setIsMobileSidebarOpen(false);
          }}
          userRole={currentUser.role}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onOpenDocModal={() => setIsDocModalOpen(true)}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-5">
          {/* Breadcrumbs & Quick Notification bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs items={breadcrumbItems} />

            {/* Quick architectural badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Desain Multi-Kelas / Multi-Mapel</span>
              </button>

              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-mono">
                <Database className="w-3 h-3 text-slate-500" />
                PostgreSQL Ready
              </span>
            </div>
          </div>

          {/* Active View Router */}
          {currentView === 'dashboard' && (
            <DashboardView
              students={students}
              classes={classes}
              rooms={rooms}
              subjects={subjects}
              supervisors={supervisors}
              schedules={schedules}
              minutes={minutes}
              settings={settings}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'schedules' && (
            <SchedulesView
              schedules={schedules}
              rooms={rooms}
              classes={classes}
              subjects={subjects}
              supervisors={supervisors}
              students={students}
              settings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              settings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'classes' && (
            <ClassesView
              classes={classes}
              students={students}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'rooms' && (
            <RoomsView
              rooms={rooms}
              schedules={schedules}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'supervisors' && (
            <SupervisorsView
              supervisors={supervisors}
              schedules={schedules}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'minutes' && (
            <ExamMinutesView
              minutes={minutes}
              schedules={schedules}
              rooms={rooms}
              classes={classes}
              subjects={subjects}
              supervisors={supervisors}
              students={students}
              attendances={attendances}
              settings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              schedules={schedules}
              rooms={rooms}
              classes={classes}
              subjects={subjects}
              supervisors={supervisors}
              students={students}
              attendances={attendances}
              settings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'makeup' && (
            <MakeUpExamsView
              makeUpExams={makeUpExams}
              schedules={schedules}
              rooms={rooms}
              classes={classes}
              subjects={subjects}
              supervisors={supervisors}
              students={students}
              attendances={attendances}
              settings={settings}
              onRefresh={refreshAllData}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              schedules={schedules}
              rooms={rooms}
              classes={classes}
              subjects={subjects}
              supervisors={supervisors}
              students={students}
              minutes={minutes}
              attendances={attendances}
              settings={settings}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogView
              logs={logs}
              currentUser={currentUser}
              onRefresh={refreshAllData}
              onResetData={handleResetData}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              students={students}
              classes={classes}
              onRefresh={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Architecture & ERD Documentation Modal */}
      <ArchitectureDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
