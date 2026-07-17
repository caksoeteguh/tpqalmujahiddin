/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, 
  QrCode, 
  Download, 
  Search, 
  SlidersHorizontal, 
  Check, 
  CheckSquare, 
  Square,
  Sparkles,
  CreditCard
} from 'lucide-react';
import QRCode from 'qrcode';
import { Santri, Kelas, TpqIdentity } from '../types';

interface QRCodeProps {
  value: string;
  size?: number;
}

// Crisp client-side QR Code renderer using the official qrcode library
export function CustomQRCode({ value, size = 100 }: QRCodeProps) {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      margin: 1,
      width: size,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrSrc(url);
      })
      .catch((err) => {
        console.error('Gagal generate QR Code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!qrSrc) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-slate-100 dark:bg-slate-800 animate-pulse rounded flex items-center justify-center text-[10px] text-slate-400 font-mono"
      >
        QR...
      </div>
    );
  }

  return (
    <img
      src={qrSrc}
      alt={`QR Code ${value}`}
      width={size}
      height={size}
      className="block object-contain"
      referrerPolicy="no-referrer"
    />
  );
}

interface CetakKartuProps {
  santriList: Santri[];
  kelasList: Kelas[];
  tpqIdentity: TpqIdentity;
}

export default function CetakKartu({
  santriList,
  kelasList,
  tpqIdentity
}: CetakKartuProps) {
  
  // Custom states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);
  const [cardTheme, setCardTheme] = useState<'emerald' | 'indigo' | 'gold' | 'rose' | 'slate'>('emerald');
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [showTpqDetails, setShowTpqDetails] = useState(true);
  const [cardFooterText, setCardFooterText] = useState('KARTU IDENTITAS SANTRI TPQ');
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  // Filter santri
  const filteredSantri = useMemo(() => {
    return santriList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKelas = selectedKelas === 'ALL' || s.kelasId === selectedKelas;
      return matchSearch && matchKelas;
    });
  }, [santriList, searchTerm, selectedKelas]);

  // Handle mass selection
  const handleToggleSelectAll = () => {
    if (selectedSantriIds.length === filteredSantri.length) {
      setSelectedSantriIds([]);
    } else {
      setSelectedSantriIds(filteredSantri.map(s => s.id));
    }
  };

  const handleToggleSelectSantri = (id: string) => {
    if (selectedSantriIds.includes(id)) {
      setSelectedSantriIds(selectedSantriIds.filter(sid => sid !== id));
    } else {
      setSelectedSantriIds([...selectedSantriIds, id]);
    }
  };

  // Preset Theme Colors mapping for Interactive UI Preview
  const themeStyles = {
    emerald: {
      border: 'border-emerald-200 dark:border-emerald-800',
      bgHeader: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      gradientBg: 'from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-950',
      stripe: 'bg-emerald-500'
    },
    indigo: {
      border: 'border-indigo-200 dark:border-indigo-800',
      bgHeader: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-50 text-indigo-800 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      gradientBg: 'from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950',
      stripe: 'bg-indigo-500'
    },
    gold: {
      border: 'border-amber-200 dark:border-amber-850',
      bgHeader: 'bg-amber-500 text-slate-950',
      badge: 'bg-amber-50 text-amber-800 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      accentColor: 'text-amber-600 dark:text-amber-400',
      gradientBg: 'from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-950',
      stripe: 'bg-amber-500'
    },
    rose: {
      border: 'border-rose-200 dark:border-rose-800',
      bgHeader: 'bg-rose-600 text-white',
      badge: 'bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
      accentColor: 'text-rose-600 dark:text-rose-400',
      gradientBg: 'from-rose-50/50 to-white dark:from-slate-900 dark:to-slate-950',
      stripe: 'bg-rose-500'
    },
    slate: {
      border: 'border-slate-300 dark:border-slate-700',
      bgHeader: 'bg-slate-700 text-white',
      badge: 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      accentColor: 'text-slate-700 dark:text-slate-300',
      gradientBg: 'from-slate-100 to-white dark:from-slate-900 dark:to-slate-950',
      stripe: 'bg-slate-600'
    }
  };

  // Download QR Code SVG
  const downloadQrCodeSvg = async (value: string, name: string) => {
    try {
      const svgString = await QRCode.toString(value, {
        type: 'svg',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${name.toLowerCase().replace(/\s+/g, '_')}_${value}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh QR Code', err);
    }
  };

  const [downloadingCardId, setDownloadingCardId] = useState<string | null>(null);

  // Download QR Code as PNG format
  const downloadQrCodePng = async (value: string, name: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(value, {
        margin: 1,
        width: 1024, // High-definition 1024px width QR Code
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode_${name.toLowerCase().replace(/\s+/g, '_')}_${value}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Gagal mengunduh QR Code PNG', err);
    }
  };

  // Download whole lanyard card as PNG using html-to-image
  const downloadCardAsPng = async (id: string, name: string) => {
    const cardElement = document.getElementById(`card-preview-${id}`);
    if (!cardElement) {
      alert("Elemen kartu tidak ditemukan!");
      return;
    }
    setDownloadingCardId(id);
    try {
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(cardElement, {
        pixelRatio: 3, // Multiplier for super high-resolution exports suitable for print
        style: {
          transform: 'scale(1)', // Ensure standard scale
          transformOrigin: 'top left',
        },
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `kartu_lanyard_${name.toLowerCase().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal mengunduh kartu sebagai PNG:", err);
      alert("Gagal mengunduh kartu sebagai PNG. Silakan coba lagi.");
    } finally {
      setDownloadingCardId(null);
    }
  };

  // Trigger browser print for selected cards in vertical (portrait lanyard) style
  const handlePrintCards = async (printAllFiltered = false) => {
    const listToPrint = printAllFiltered ? filteredSantri : santriList.filter(s => selectedSantriIds.includes(s.id));
    
    if (listToPrint.length === 0) {
      alert("Silakan pilih santri terlebih dahulu atau aktifkan opsi cetak semua!");
      return;
    }

    setIsGeneratingPrint(true);

    try {
      // 1. Pre-generate all QR code data URLs asynchronously to guarantee zero race conditions on render
      const qrsMap: { [barcode: string]: string } = {};
      for (const s of listToPrint) {
        qrsMap[s.barcode] = await QRCode.toDataURL(s.barcode, {
          margin: 1,
          width: 150,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      }

      // 2. Open printable window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan di browser Anda.");
        setIsGeneratingPrint(false);
        return;
      }

      // 3. Generate HTML for portrait cards
      let cardsHtml = '';
      
      listToPrint.forEach((s) => {
        const className = kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas';
        const qrDataUrl = qrsMap[s.barcode] || '';
        
        cardsHtml += `
          <div class="print-card-box">
            <!-- Lanyard Hole Slot Accent -->
            <div class="card-lanyard-hole-container">
              <div class="card-lanyard-slot"></div>
            </div>

            <!-- Header Section with TPQ Identity -->
            <div class="card-header ${cardTheme}">
              <div class="logo-box">
                ${tpqIdentity.logo 
                  ? `<img src="${tpqIdentity.logo}" class="tpq-logo" />` 
                  : `<div class="tpq-logo-placeholder">📖</div>`}
              </div>
              <div class="header-text-box">
                <h2 class="tpq-name">${tpqIdentity.name}</h2>
                ${showTpqDetails ? `<p class="tpq-subtitle">${tpqIdentity.address || ''}</p>` : ''}
              </div>
            </div>
            
            <!-- Body Profile Section -->
            <div class="card-body">
              <div class="avatar-circle">
                <span class="avatar-text">${s.name.charAt(0)}</span>
              </div>
              <h3 class="student-name">${s.name}</h3>
              
              <div class="student-class-badge ${cardTheme}">
                ${className}
              </div>
              
              <p class="student-id">ID: ${s.barcode}</p>
            </div>

            <!-- QR Code Section -->
            <div class="qrcode-area">
              ${qrDataUrl 
                ? `<img src="${qrDataUrl}" class="qr-code-img" />` 
                : `<div class="qr-placeholder">Gagal QR</div>`}
            </div>

            <!-- Footer Section with Custom Text -->
            <div class="card-footer">
              ${cardFooterText}
            </div>
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Kartu Lanyard - ${tpqIdentity.name}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
              
              body {
                font-family: 'Inter', sans-serif;
                background-color: #ffffff;
                margin: 0;
                padding: 20px;
                color: #1e293b;
              }

              /* A4 page wrapper styling, optimal portrait lanyard grid (3 cards horizontally) */
              .print-grid {
                display: grid;
                grid-template-columns: repeat(3, 240px);
                gap: 25px 20px;
                justify-content: center;
                page-break-after: always;
              }

              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                .no-print {
                  display: none;
                }
                .print-grid {
                  grid-template-columns: repeat(3, 240px);
                  gap: 30px 20px;
                  padding-top: 15px;
                }
              }

              /* Portrait Lanyard standard size (~ 54mm x 85.6mm equivalent at screen scaling) */
              .print-card-box {
                width: 240px;
                height: 385px;
                border: 1.5px solid #cbd5e1;
                border-radius: 14px;
                background-color: #ffffff;
                overflow: hidden;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                page-break-inside: avoid;
                box-sizing: border-box;
              }

              /* Lanyard hole slot simulation */
              .card-lanyard-hole-container {
                display: flex;
                justify-content: center;
                padding-top: 8px;
                background-color: #ffffff;
                box-sizing: border-box;
                z-index: 10;
              }
              .card-lanyard-slot {
                width: 38px;
                height: 8px;
                border-radius: 4px;
                background-color: #f1f5f9;
                border: 1.2px solid #cbd5e1;
              }

              /* Card Header portrait style */
              .card-header {
                padding: 8px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                border-bottom: 3px solid #10b981;
                color: white;
                box-sizing: border-box;
              }

              .card-header.emerald { background-color: #059669; border-bottom-color: #047857; color: #ffffff; }
              .card-header.indigo { background-color: #4f46e5; border-bottom-color: #3730a3; color: #ffffff; }
              .card-header.rose { background-color: #e11d48; border-bottom-color: #be123c; color: #ffffff; }
              .card-header.slate { background-color: #475569; border-bottom-color: #334155; color: #ffffff; }
              .card-header.gold { background-color: #f59e0b; border-bottom-color: #d97706; color: #0f172a; }

              .logo-box {
                width: 32px;
                height: 32px;
                background: white;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                margin-bottom: 5px;
                flex-shrink: 0;
              }

              .tpq-logo {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }

              .tpq-logo-placeholder {
                font-size: 16px;
              }

              .header-text-box {
                width: 100%;
                overflow: hidden;
              }

              .tpq-name {
                margin: 0;
                font-size: 10.5px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .tpq-subtitle {
                margin: 2px 0 0 0;
                font-size: 7px;
                opacity: 0.9;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 500;
              }

              /* Card Body (Profile Info) */
              .card-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 10px 12px 6px 12px;
                box-sizing: border-box;
                background-color: #fafbfd;
              }

              .avatar-circle {
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
                border: 2px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
                margin-bottom: 6px;
              }

              .avatar-text {
                font-size: 24px;
                font-weight: 900;
                color: #475569;
              }

              .student-name {
                font-size: 12px;
                font-weight: 900;
                color: #0f172a;
                text-align: center;
                margin: 0 0 4px 0;
                line-height: 1.25;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              /* Badges inside card */
              .student-class-badge {
                display: inline-block;
                font-size: 7.5px;
                font-weight: 900;
                text-transform: uppercase;
                padding: 1.5px 7px;
                border-radius: 10px;
                margin-bottom: 4px;
                letter-spacing: 0.4px;
              }
              .student-class-badge.emerald { background-color: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }
              .student-class-badge.indigo { background-color: #eef2ff; color: #4338ca; border: 1px solid #e0e7ff; }
              .student-class-badge.rose { background-color: #fff1f2; color: #be123c; border: 1px solid #ffe4e6; }
              .student-class-badge.slate { background-color: #f8fafc; color: #475569; border: 1px solid #f1f5f9; }
              .student-class-badge.gold { background-color: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }

              .student-id {
                font-family: 'JetBrains Mono', monospace;
                font-size: 7.5px;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 1px;
                margin: 0;
              }

              /* QR Code Section */
              .qrcode-area {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 8px 12px;
                background-color: #ffffff;
                border-top: 1px dashed #e2e8f0;
                box-sizing: border-box;
              }

              .qr-code-img {
                width: 76px;
                height: 76px;
                display: block;
              }

              .qr-placeholder {
                width: 76px;
                height: 76px;
                background-color: #f1f5f9;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                color: #94a3b8;
              }

              /* Card Footer text */
              .card-footer {
                height: 18px;
                background-color: #f1f5f9;
                color: #64748b;
                font-size: 7px;
                font-weight: 800;
                text-align: center;
                line-height: 18px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                border-top: 1px solid #e2e8f0;
                box-sizing: border-box;
                flex-shrink: 0;
              }

              .btn-print-trigger {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background-color: #4f46e5;
                color: white;
                font-weight: bold;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
                z-index: 1000;
                font-family: 'Inter', sans-serif;
              }

              .btn-print-trigger:hover {
                background-color: #4338ca;
              }
            </style>
          </head>
          <body>
            <button class="btn-print-trigger no-print" onclick="window.print();">
              🖨️ Cetak Kartu Sekarang
            </button>
            
            <div class="print-grid">
              ${cardsHtml}
            </div>
            
            <script>
              // Wait for assets to load, then trigger printable interface
              window.addEventListener('load', () => {
                setTimeout(() => {
                  window.print();
                }, 400);
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert('Gagal menyiapkan QR Code untuk pencetakan.');
    } finally {
      setIsGeneratingPrint(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-md font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-emerald-500" size={20} />
            Cetak Kartu Identitas & QR Code Santri
          </h2>
          <p className="text-xs text-slate-400 mt-1">Unduh QR code individual atau cetak kartu santri gaya potret lanyard siap dikalungkan.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePrintCards(true)}
            disabled={isGeneratingPrint}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Printer size={14} /> {isGeneratingPrint ? 'Menyiapkan...' : `Cetak Semua Lanyard (${filteredSantri.length} Santri)`}
          </button>
          <button
            onClick={() => handlePrintCards(false)}
            disabled={selectedSantriIds.length === 0 || isGeneratingPrint}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
              selectedSantriIds.length > 0 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed'
            }`}
          >
            <Printer size={14} /> Cetak Terseleksi ({selectedSantriIds.length})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Left column: Customizer & Settings panel */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Customizer Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-slate-800">
              <SlidersHorizontal size={14} className="text-emerald-500" />
              Desain Kartu Lanyard
            </h3>
            
            {/* Theme selectors */}
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Pilih Tema Warna</label>
                <div className="flex flex-wrap gap-2">
                  {(['emerald', 'indigo', 'gold', 'rose', 'slate'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setCardTheme(t)}
                      className={`h-7 px-2.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                        cardTheme === t
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        t === 'emerald' ? 'bg-emerald-500' :
                        t === 'indigo' ? 'bg-indigo-500' :
                        t === 'gold' ? 'bg-amber-500' :
                        t === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
                      }`} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text footer customization */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Keterangan Bawah Kartu</label>
                <input
                  type="text"
                  value={cardFooterText}
                  onChange={(e) => setCardFooterText(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  placeholder="KARTU IDENTITAS SANTRI"
                />
              </div>

              {/* Toggle switch details */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setShowTpqDetails(!showTpqDetails)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  <div className={`h-4 w-4 rounded-sm flex items-center justify-center border transition-all ${
                    showTpqDetails ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'
                  }`}>
                    {showTpqDetails && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span>Tampilkan Alamat TPQ</span>
                </button>
                
                <button
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  <div className={`h-4 w-4 rounded-sm flex items-center justify-center border transition-all ${
                    isCompactMode ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'
                  }`}>
                    {isCompactMode && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span>Sembunyikan Kelas & ID</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Petunjuk Cetak Potret:</h4>
            <ul className="text-[10px] text-slate-500 space-y-1.5 leading-relaxed dark:text-slate-400">
              <li>&bull; Gunakan kertas tebal seperti <strong>Art Paper 260gsm</strong> agar kartu terasa kokoh.</li>
              <li>&bull; Desain kartu dirancang dalam format <strong>potret lanyard (gantungan tali leher)</strong>.</li>
              <li>&bull; Centang opsi <strong>"Background Graphics"</strong> di menu print browser agar warna tema tampil sempurna.</li>
            </ul>
          </div>

        </div>

        {/* Right column: Filter headers and student card lists */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filtering bar */}
          <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            
            {/* Search inputs */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari santri berdasarkan nama / nomor barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 outline-hidden bg-slate-50/50 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Class filter dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 outline-hidden bg-slate-50/50 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            {/* Mass checklist toggle */}
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950 cursor-pointer"
            >
              {selectedSantriIds.length === filteredSantri.length && filteredSantri.length > 0 ? (
                <>
                  <CheckSquare size={14} className="text-emerald-500" /> Uncheck Semua
                </>
              ) : (
                <>
                  <Square size={14} /> Pilih Semua ({filteredSantri.length})
                </>
              )}
            </button>
          </div>

          {/* Cards Grid list view */}
          {filteredSantri.length === 0 ? (
            <div className="rounded-xl border border-slate-150 p-12 text-center bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <QrCode size={40} className="mx-auto text-slate-300 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Data Santri Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau filter kelas Anda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSantri.map(s => {
                const className = kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas';
                const isSelected = selectedSantriIds.includes(s.id);
                const theme = themeStyles[cardTheme];

                return (
                  <div 
                    key={s.id} 
                    className={`relative rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-slate-900 ${
                      isSelected ? 'ring-2 ring-indigo-500/85 border-indigo-400' : 'border-slate-150 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Select Box Checkbox Trigger */}
                    <div 
                      onClick={() => handleToggleSelectSantri(s.id)}
                      className="absolute top-2.5 left-2.5 z-20 h-5 w-5 rounded-full bg-slate-950/45 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                      title="Pilih santri ini untuk dicetak"
                    >
                      {isSelected ? (
                        <CheckSquare size={13} className="text-emerald-400 fill-emerald-950/20" />
                      ) : (
                        <Square size={13} className="text-slate-200" />
                      )}
                    </div>

                    {/* Miniature Portrait Preview of the Lanyard Card */}
                    <div className={`p-4 ${theme.gradientBg} flex justify-center items-center border-b border-slate-100 dark:border-slate-850/60`}>
                      <div 
                        id={`card-preview-${s.id}`}
                        className={`w-[220px] h-[350px] rounded-2xl border ${theme.border} bg-white dark:bg-slate-950 overflow-hidden shadow-xs flex flex-col justify-between relative`}
                      >
                        
                        {/* Clip slot lanyard hole illustration */}
                        <div className="flex justify-center pt-2 pb-0.5">
                          <div className="w-8 h-1.5 rounded-full bg-slate-200 border border-slate-300/40 dark:bg-slate-800 dark:border-slate-700/40" />
                        </div>

                        {/* Card header of portrait style */}
                        <div className={`px-3 py-2 text-center flex flex-col items-center ${theme.bgHeader}`}>
                          <div className="h-7 w-7 rounded bg-white p-0.5 flex items-center justify-center overflow-hidden shadow-xs mb-1 shrink-0">
                            {tpqIdentity.logo ? (
                              <img src={tpqIdentity.logo} alt="L" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-sm">📖</span>
                            )}
                          </div>
                          <div className="overflow-hidden w-full leading-tight">
                            <h4 className="text-[10px] font-black uppercase tracking-wider block truncate">{tpqIdentity.name}</h4>
                            {showTpqDetails && (
                              <p className="text-[7px] font-medium opacity-85 truncate block">{tpqIdentity.address}</p>
                            )}
                          </div>
                        </div>

                        {/* Profile/avatar layout inside portrait card */}
                        <div className="flex-1 p-3 flex flex-col items-center justify-center text-center space-y-1.5 bg-slate-50/25 dark:bg-slate-950/25">
                          <div className="relative">
                            <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 ${theme.border} flex items-center justify-center shadow-inner dark:from-slate-850 dark:to-slate-900`}>
                              <span className="text-xl font-black text-slate-500 dark:text-slate-450">{s.name.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 bg-white border border-slate-150 rounded-full p-0.5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
                              <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                            </div>
                          </div>

                          <div className="space-y-0.5 w-full overflow-hidden">
                            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate px-1" title={s.name}>
                              {s.name}
                            </h3>
                            {!isCompactMode && (
                              <>
                                <div className="flex justify-center">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase tracking-wide ${theme.badge}`}>
                                    {className}
                                  </span>
                                </div>
                                <p className="font-mono text-[7px] text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-0.5">
                                  ID: {s.barcode}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* QR Code section inside preview card */}
                        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center justify-center shrink-0">
                          <CustomQRCode value={s.barcode} size={64} />
                        </div>

                        {/* Bottom border text banner */}
                        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 text-center py-0.5 text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
                          {cardFooterText}
                        </div>

                      </div>
                    </div>

                    {/* Action buttons footer inside preview items */}
                    <div className="bg-slate-50/60 p-3 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {s.id.split('_').pop()}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400">QR Code:</span>
                          <button
                            onClick={() => downloadQrCodePng(s.barcode, s.name)}
                            className="text-[9px] font-extrabold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                            title="Unduh QR Code format PNG (Resolusi Tinggi)"
                          >
                            PNG
                          </button>
                          <span className="text-[9px] text-slate-300">|</span>
                          <button
                            onClick={() => downloadQrCodeSvg(s.barcode, s.name)}
                            className="text-[9px] font-extrabold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                            title="Unduh QR Code format SVG (Vector)"
                          >
                            SVG
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadCardAsPng(s.id, s.name)}
                          disabled={downloadingCardId === s.id}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-all cursor-pointer dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 disabled:opacity-50"
                        >
                          <Download size={11} /> {downloadingCardId === s.id ? 'Memproses...' : 'Unduh Kartu PNG'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSantriIds([s.id]);
                            setTimeout(() => {
                              handlePrintCards(false);
                            }, 100);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                        >
                          <Printer size={11} /> Cetak Lanyard
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
