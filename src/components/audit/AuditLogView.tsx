import React, { useState, useMemo } from 'react';
import {
  History,
  Download,
  Upload,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Database,
  FileJson,
  Calendar,
  UserCheck
} from 'lucide-react';
import { AuditLog, User } from '../../types';
import { StorageService } from '../../lib/storage';

interface AuditLogViewProps {
  logs: AuditLog[];
  currentUser: User;
  onRefresh: () => void;
  onResetData: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  currentUser,
  onRefresh,
  onResetData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entityId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchEntity = entityFilter === 'ALL' || log.entity === entityFilter;
      return matchSearch && matchAction && matchEntity;
    });
  }, [logs, searchTerm, actionFilter, entityFilter]);

  // Backup Download JSON
  const handleBackupDownload = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Administrasi_Ujian_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Backup database JSON berhasil diunduh.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Restore JSON
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('PERINGATAN: Memulihkan database dari file backup akan menggantikan data yang ada saat ini. Lanjutkan?')) {
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const res = StorageService.restoreBackupJson(content);
        if (res.success) {
          onRefresh();
          setSuccessMessage('Database berhasil dipulihkan dari file backup!');
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setErrorMessage(res.message);
          setTimeout(() => setErrorMessage(null), 5000);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setErrorMessage(`Gagal membaca file backup: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Audit Trail &amp; Backup Sistem
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat log aktivitas pengguna dan pencadangan / pemulihan database ujian sekolah secara terenkapsulasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBackupDownload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Backup JSON
          </button>

          <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetData}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 rounded-r-lg text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {errorMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari aktivitas, username, entitas..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="RESTORE">RESTORE</option>
            <option value="RESET">RESET</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Entitas</option>
            <option value="SCHEDULE">SCHEDULE</option>
            <option value="ROOM">ROOM</option>
            <option value="STUDENT">STUDENT</option>
            <option value="CLASS">CLASS</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="SETTINGS">SETTINGS</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4 text-center">Aksi</th>
                <th className="py-3 px-4">Entitas</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada catatan log aktivitas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      @{log.username}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-slate-700">
                      {log.entity}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
