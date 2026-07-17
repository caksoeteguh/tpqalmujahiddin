/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  Trash2, 
  Building, 
  Phone, 
  MapPin, 
  FileText, 
  Eye, 
  Check, 
  RotateCcw,
  Sparkles,
  BookOpenCheck
} from 'lucide-react';
import { TpqIdentity, Role } from '../types';

interface IdentitasTpqProps {
  tpqIdentity: TpqIdentity;
  onUpdateIdentity: (identity: TpqIdentity) => void;
  currentUserRole: Role;
}

// Preset pre-made beautiful icons for TPQ if user doesn't have an image file
const LOGO_PRESETS = [
  {
    name: 'Hijau Klasik (Default)',
    value: 'DEFAULT_GREEN',
    bgColor: 'bg-emerald-500',
    iconColor: 'text-white'
  },
  {
    name: 'Biru Edukasi',
    value: 'PRESET_BLUE',
    bgColor: 'bg-indigo-600',
    iconColor: 'text-white'
  },
  {
    name: 'Emas Spiritual',
    value: 'PRESET_GOLD',
    bgColor: 'bg-amber-500',
    iconColor: 'text-slate-900'
  },
  {
    name: 'Teal Modern',
    value: 'PRESET_TEAL',
    bgColor: 'bg-teal-500',
    iconColor: 'text-white'
  }
];

export default function IdentitasTpq({
  tpqIdentity,
  onUpdateIdentity,
  currentUserRole
}: IdentitasTpqProps) {

  const [name, setName] = useState(tpqIdentity.name);
  const [address, setAddress] = useState(tpqIdentity.address);
  const [phone, setPhone] = useState(tpqIdentity.phone);
  const [footerText, setFooterText] = useState(tpqIdentity.footerText);
  const [logo, setLogo] = useState(tpqIdentity.logo);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditable = ['Walikelas', 'Admin', 'KepalaTPQ'].includes(currentUserRole);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file logo terlalu besar. Maksimal 1.5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result);
        setMessage({ type: 'success', text: 'Logo berhasil diunggah! Tekan simpan untuk memperbarui.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetValue: string) => {
    setLogo(presetValue);
    setMessage({ type: 'success', text: `Preset logo terpilih! Tekan simpan untuk menerapkan.` });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama TPQ tidak boleh kosong.' });
      return;
    }

    onUpdateIdentity({
      name,
      address,
      phone,
      logo,
      footerText
    });

    setMessage({ type: 'success', text: 'Identitas dan Logo TPQ berhasil disimpan secara permanen!' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleReset = () => {
    setName('TPQ TPQKita');
    setAddress('Gedung Pusat Kajian Islam No. 5');
    setPhone('0812-9999-8888');
    setLogo('');
    setFooterText('TPQKita Digital Workspace');
    setMessage({ type: 'success', text: 'Konfigurasi telah di-reset ke pengaturan default.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Explanation Header */}
      <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-4 items-start">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Multi-Tenant & Pengaturan Identitas TPQ</h3>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Ubah identitas, kontak, alamat, serta logo TPQ Anda di bawah ini. Perubahan ini akan segera dicerminkan di seluruh antarmuka aplikasi termasuk menu utama, lembar login, dan kop rekapitulasi cetak.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Form Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Building size={16} className="text-indigo-500" /> Profil Lembaga TPQ
            </h4>

            {message && (
              <div className={`p-3.5 rounded-lg text-xs font-bold mb-4 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama TPQ / Lembaga</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isEditable}
                    placeholder="cth: TPQ Al-Ikhlas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  />
                  <Building className="absolute left-3 top-2.5 text-slate-400" size={14} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Alamat Lengkap</label>
                <div className="relative">
                  <textarea
                    disabled={!isEditable}
                    rows={2}
                    placeholder="cth: Jl. Masjid Jami No. 12, Kel. Sukamaju..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={14} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nomor Telepon / Kontak</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={!isEditable}
                      placeholder="cth: 0812-3456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Teks Footer Hak Cipta</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={!isEditable}
                      placeholder="cth: TPQ Al-Ikhlas Digital Workspace"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <FileText className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 dark:text-slate-400">Unggah Logo Kustom TPQ</label>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Current logo preview box */}
                  <div className="h-20 w-20 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
                    {logo && logo.startsWith('data:image') ? (
                      <img src={logo} alt="Logo Kustom" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                        logo === 'PRESET_BLUE' ? 'bg-indigo-600 text-white' :
                        logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                        logo === 'PRESET_TEAL' ? 'bg-teal-500 text-white' :
                        'bg-emerald-500 text-white'
                      }`}>
                        <BookOpenCheck size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    {isEditable ? (
                      <>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all dark:bg-indigo-950/40 dark:text-indigo-400"
                          >
                            <Upload size={14} /> Unggah File Logo
                          </button>
                          {logo && (
                            <button
                              type="button"
                              onClick={() => setLogo('')}
                              className="flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all dark:bg-rose-950/40 dark:text-rose-400"
                            >
                              <Trash2 size={14} /> Hapus Kustom
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Format PNG, JPG, atau SVG (Rekomendasi rasio 1:1, maks 1.5MB)</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Hanya Admin atau Kepala TPQ yang dapat merubah gambar logo.</p>
                    )}
                  </div>
                </div>

                {/* Logo Presets Selection */}
                {isEditable && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Atau Gunakan Template Warna Logo:</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {LOGO_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleSelectPreset(preset.value)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                            logo === preset.value || (preset.value === 'DEFAULT_GREEN' && !logo)
                              ? 'border-emerald-500 bg-emerald-50/20 dark:border-emerald-700' 
                              : 'border-slate-100 bg-slate-50/50 dark:border-slate-850'
                          }`}
                        >
                          <div className={`h-6 w-6 rounded-md ${preset.bgColor} ${preset.iconColor} flex items-center justify-center shrink-0`}>
                            <BookOpenCheck size={12} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{preset.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditable && (
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <RotateCcw size={14} /> Reset Default
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none"
                  >
                    <Check size={14} /> Simpan Identitas TPQ
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Card 1: Branding Preview Mockup */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Eye size={14} className="text-indigo-500" /> Preview Header Aplikasi
            </h4>

            {/* Sidebar Branding simulator */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simulasi Header Sidebar:</p>
              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                {logo && logo.startsWith('data:image') ? (
                  <img src={logo} alt="Logo" className="h-10 w-10 object-cover rounded-xl" />
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                    logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                    logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                    logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                    'bg-emerald-500'
                  }`}>
                    <BookOpenCheck size={22} />
                  </div>
                )}
                <div>
                  <span className="text-sm font-bold tracking-tight text-white block truncate max-w-[150px]">
                    {name}
                  </span>
                  <p className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">TPQ Digital App</p>
                </div>
              </div>
            </div>

            {/* General Letter Kop / Print preview simulator */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mt-4 text-slate-800 dark:bg-slate-950 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Simulasi Kop Surat / Rekap Cetak:</p>
              
              <div className="bg-white p-4 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-850">
                <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-2 dark:border-slate-700">
                  {logo && logo.startsWith('data:image') ? (
                    <img src={logo} alt="Logo" className="h-11 w-11 object-cover rounded-md" />
                  ) : (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-md text-white shrink-0 ${
                      logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                      logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                      logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                      'bg-emerald-500'
                    }`}>
                      <BookOpenCheck size={22} />
                    </div>
                  )}
                  <div className="text-left overflow-hidden">
                    <h5 className="text-[11px] font-extrabold uppercase text-slate-900 dark:text-white truncate">{name}</h5>
                    <p className="text-[8px] text-slate-500 truncate dark:text-slate-400">{address}</p>
                    <p className="text-[8px] text-slate-500 dark:text-slate-400">Hubungi: {phone}</p>
                  </div>
                </div>
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">LAPORAN REKAPITULASI CAPAIAN SANTRI</p>
                  <p className="text-[8px] text-slate-400 mt-1">Dicetak secara digital terekam database</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata info */}
          <div className="rounded-xl border border-indigo-50 bg-indigo-50/20 p-4 dark:border-indigo-950 dark:bg-indigo-950/10">
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
              <Sparkles size={14} /> Multi-Tenant Ready
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed dark:text-slate-400">
              Konfigurasi ini disimpan di penyimpanan lokal browser (<span className="font-semibold text-slate-700 dark:text-slate-300">LocalStorage</span>) dan sepenuhnya tersinkronisasi untuk mendukung integrasi web PHP dan MySQL di luar server ini.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
