export interface SessionOption {
  session: number;
  label: string;
  shortLabel: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

export const SESSION_OPTIONS: SessionOption[] = [
  {
    session: 1,
    label: 'Sesi 1 (Jam Ke-1)',
    shortLabel: 'Sesi 1 (Jam Ke-1)',
    defaultStartTime: '07:30',
    defaultEndTime: '08:30'
  },
  {
    session: 2,
    label: 'Sesi 2 (Jam Ke-2)',
    shortLabel: 'Sesi 2 (Jam Ke-2)',
    defaultStartTime: '09:00',
    defaultEndTime: '10:00'
  },
  {
    session: 3,
    label: 'Sesi 3 (Jam Ke-3)',
    shortLabel: 'Sesi 3 (Jam Ke-3)',
    defaultStartTime: '10:00',
    defaultEndTime: '11:00'
  }
];

export function getSessionLabel(session: number | undefined | null): string {
  if (session === undefined || session === null) return '-';
  const opt = SESSION_OPTIONS.find((s) => s.session === Number(session));
  if (opt) return opt.label;
  return `Sesi ${session} (Jam Ke-${session})`;
}

export function getDefaultTimesForSession(session: number): { startTime: string; endTime: string } {
  const opt = SESSION_OPTIONS.find((s) => s.session === Number(session));
  if (opt) {
    return { startTime: opt.defaultStartTime, endTime: opt.defaultEndTime };
  }
  return { startTime: '07:30', endTime: '08:30' };
}

/**
 * Trigger print with standardized A4 document title for PDF export
 */
export function triggerA4Print(documentTitle?: string) {
  const originalTitle = document.title;
  if (documentTitle) {
    document.title = documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
