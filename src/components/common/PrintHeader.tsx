import React from 'react';
import { SchoolSetting } from '../../types';

interface PrintHeaderProps {
  settings: SchoolSetting;
  documentTitle: string;
  documentSubtitle?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  settings,
  documentTitle,
  documentSubtitle
}) => {
  return (
    <div className="border-b-2 border-black pb-3 mb-6 font-serif">
      <div className="flex items-center justify-between gap-4">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Logo Sekolah"
            className="w-20 h-20 object-contain"
          />
        ) : (
          <div className="w-20 h-20 border-2 border-black rounded flex flex-col items-center justify-center text-center p-1 text-[10px] font-bold">
            <span>LOGO</span>
            <span>SEKOLAH</span>
          </div>
        )}

        <div className="flex-1 text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-gray-700">
            PEMERINTAH DAERAH PROVINSI {settings.province.toUpperCase()}
          </p>
          <p className="text-xs font-semibold tracking-wider uppercase text-gray-700">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-black">
            {settings.schoolName}
          </h1>
          <p className="text-xs text-gray-700 leading-tight mt-0.5">
            {settings.address}
            {settings.village ? `, Kel. ${settings.village}` : ''}
            {settings.district ? `, Kec. ${settings.district}` : ''}
            {settings.city ? `, ${settings.city}` : ''}
            {settings.postalCode ? ` - ${settings.postalCode}` : ''}
          </p>
          <p className="text-[11px] text-gray-600 mt-0.5">
            NPSN: {settings.npsn} {settings.nss ? `| NSS: ${settings.nss}` : ''} | Telp: {settings.phone} | Email: {settings.email}
          </p>
        </div>

        <div className="w-20 h-20 invisible"></div>
      </div>

      {/* Double line Kop Surat */}
      <div className="mt-3 border-t-2 border-b border-black h-1"></div>

      {/* Document Title */}
      <div className="text-center mt-4">
        <h2 className="text-base font-bold uppercase tracking-wider underline">
          {documentTitle}
        </h2>
        {documentSubtitle && (
          <p className="text-xs font-medium text-gray-700 mt-0.5">
            {documentSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};
