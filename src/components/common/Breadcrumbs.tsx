import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void; active?: boolean }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4 overflow-x-auto py-1">
      <div className="flex items-center gap-1.5 shrink-0">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-700 cursor-default">Ujian Sekolah</span>
      </div>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 shrink-0" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`hover:text-blue-600 transition-colors shrink-0 ${
                item.active ? 'font-semibold text-slate-800' : ''
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span
              className={`shrink-0 ${
                item.active ? 'font-semibold text-slate-800' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
