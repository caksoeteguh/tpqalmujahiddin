import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Santri, Ustadz, User } from '../types';

interface ExcelImportExportProps {
  type: 'santri' | 'ustadz' | 'user';
  onImport: (data: any[]) => void;
}

export default function ExcelImportExport({ type, onImport }: ExcelImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    let wsData: any[] = [];
    if (type === 'santri') {
      wsData = [
        ["Nama Santri", "Barcode", "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Nama Orang Tua", "No HP Orang Tua"],
        ["Ahmad Dahlan", "S001", "Jakarta", "2010-05-12", "Budi Dahlan", "08123456789"]
      ];
    } else if (type === 'ustadz') {
      wsData = [
        ["Nama Ustadz", "Username", "No HP", "Mata Pelajaran (Pisahkan dengan koma)"],
        ["Ustadz Ali", "ustadz.ali", "08123456789", "Jilid,Tahfidz"]
      ];
    } else {
      wsData = [
        ["Nama", "Username", "Password", "Role (Admin/Ustadz/OrangTua/KepalaTPQ/Walikelas)", "ID Terkait"],
        ["Ahmad Fauzi", "ahmad.fauzi", "password123", "Ustadz", "U001"]
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Template_${type}`);
    XLSX.writeFile(wb, `Template_Data_${type}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Remove header row
        data.shift();
        
        const parsedData: any[] = [];
        if (type === 'santri') {
          data.forEach((row: any) => {
            if (row[0]) {
              parsedData.push({
                id: `S_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                name: String(row[0] || ''),
                barcode: String(row[1] || `B${Date.now()}`),
                birthPlace: String(row[2] || ''),
                birthDate: String(row[3] || ''),
                kelasId: '',
                parentName: String(row[4] || ''),
                parentPhone: String(row[5] || ''),
                parentUsername: String(row[5] || '') ? `ortu.${String(row[5]).slice(-4)}` : ''
              } as Santri);
            }
          });
        } else if (type === 'ustadz') {
          data.forEach((row: any) => {
            if (row[0]) {
              const subjectsStr = String(row[3] || '');
              const subjects = subjectsStr.split(',').map(s => s.trim()).filter(s => s === 'Jilid' || s === 'Tahfidz' || s === 'Ibadah Praktis') as any[];
              parsedData.push({
                id: `U_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                name: String(row[0] || ''),
                username: String(row[1] || ''),
                phone: String(row[2] || ''),
                subjects: subjects.length > 0 ? subjects : ['Jilid'],
                kelasIds: []
              } as Ustadz);
            }
          });
        } else {
          data.forEach((row: any) => {
            if (row[0]) {
              parsedData.push({
                id: `US_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                name: String(row[0] || ''),
                username: String(row[1] || '').toLowerCase(),
                password: String(row[2] || 'password'),
                role: String(row[3] || 'Ustadz'),
                linkedId: String(row[4] || '')
              } as User);
            }
          });
        }
        
        if (parsedData.length > 0) {
          onImport(parsedData);
          alert(`Berhasil mengimpor ${parsedData.length} data ${type}!`);
        } else {
          alert('Tidak ada data yang diimpor. Pastikan format file sesuai template.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadTemplate}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-pointer"
      >
        <Download size={14} /> Unduh Template Excel
      </button>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 transition-all hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 cursor-pointer"
      >
        <FileSpreadsheet size={14} /> Impor dari Excel
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />
    </div>
  );
}
