/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Search, 
  User, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Sparkles, 
  Camera, 
  Check, 
  AlertCircle, 
  History,
  CheckCircle2,
  Calendar,
  BookMarked
} from 'lucide-react';
import { 
  Santri, 
  Kelas, 
  Ustadz, 
  CapaianJilid, 
  CapaianTahfidz, 
  CapaianIbadahPraktis, 
  Jilid, 
  Surat,
  IbadahMaterial
} from '../types';

interface BarcodeScannerProps {
  autoStartCamera?: boolean;
  santriList: Santri[];
  kelasList: Kelas[];
  ustadzList: Ustadz[];
  jilidList: Jilid[];
  suratList: Surat[];
  capaianJilid: CapaianJilid[];
  capaianTahfidz: CapaianTahfidz[];
  capaianIbadah: CapaianIbadahPraktis[];
  ibadahMaterials?: IbadahMaterial[];
  subjectsList?: string[];
  onAddJilidEvaluation: (evaluation: Omit<CapaianJilid, 'id' | 'updatedAt'>) => void;
  onAddTahfidzEvaluation: (evaluation: Omit<CapaianTahfidz, 'id' | 'updatedAt'>) => void;
  onAddIbadahEvaluation: (evaluation: Omit<CapaianIbadahPraktis, 'id' | 'updatedAt'>) => void;
  initialScannedBarcode: string;
  clearInitialBarcode: () => void;
}

export default function BarcodeScanner({
  autoStartCamera = false,
  santriList,
  kelasList,
  ustadzList,
  jilidList,
  suratList,
  capaianJilid,
  capaianTahfidz,
  capaianIbadah,
  ibadahMaterials,
  subjectsList,
  onAddJilidEvaluation,
  onAddTahfidzEvaluation,
  onAddIbadahEvaluation,
  initialScannedBarcode,
  clearInitialBarcode,
}: BarcodeScannerProps) {

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(autoStartCamera);
  const lastScannedRef = useRef({ code: '', time: 0 });

  // Sound effect indicator for successful scans
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine'; // sine wave
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high pitched beep
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // reasonable volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15); // quick fade out

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15); // duration 150ms
    } catch (error) {
      console.error('Error playing scan sound:', error);
    }
  };

  // Camera permission and scanning activation via Html5Qrcode
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isStarting = false;
    let isMounted = true;

    if (isCameraActive) {
      const startScanner = async () => {
        try {
          // Allow a brief moment for the DOM container to render/display
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (!isMounted) return;

          const container = document.getElementById('camera-reader');
          if (!container) {
            console.error('Elemen kontainer "camera-reader" tidak ditemukan.');
            return;
          }

          html5QrCode = new Html5Qrcode('camera-reader');
          isStarting = true;

          const qrCodeSuccessCallback = (decodedText: string) => {
            if (!isMounted) return;
            const cleanCode = decodedText.trim();
            if (!cleanCode) return;

            // Cooldown to prevent repetitive scans of the same code
            const now = Date.now();
            if (lastScannedRef.current.code === cleanCode && now - lastScannedRef.current.time < 3000) {
              return;
            }

            lastScannedRef.current = { code: cleanCode, time: now };

            // Look up student by barcode or id
            const found = santriList.find(
              s => s.barcode.toLowerCase() === cleanCode.toLowerCase() || s.id.toLowerCase() === cleanCode.toLowerCase()
            );

            if (found) {
              setSelectedSantri(found);
              setBarcodeInput(found.barcode);
              playBeep(); // Suara bip penanda sukses scan!
              showTemporaryBanner(`Kamera berhasil memindai: ${found.name}`);
              setScanMessage(null);
            } else {
              setScanMessage(`Barcode "${cleanCode}" tidak terdaftar dalam santri.`);
            }
          };

          const config = {
            fps: 15,
            // Omit qrbox and aspectRatio to scan the full video frame.
            // This is extremely robust and easily decodes both wide 1D barcodes and QR codes!
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            qrCodeSuccessCallback,
            () => {
              // Ignore scanning frame failures to avoid console flood
            }
          );
          
          isStarting = false;
          console.log('Scanner camera started successfully.');
        } catch (err) {
          isStarting = false;
          console.error('Gagal memulai scanner kamera:', err);
          if (isMounted) {
            setScanMessage('Kamera gagal diakses atau sedang digunakan oleh aplikasi lain.');
            setIsCameraActive(false);
          }
        }
      };

      startScanner();
    }

    return () => {
      isMounted = false;
      const stopScanner = async () => {
        // Wait for the initialization promise to finish first to prevent race condition locks
        if (isStarting) {
          let attempts = 0;
          while (isStarting && attempts < 20) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
        }
        if (html5QrCode && html5QrCode.isScanning) {
          try {
            await html5QrCode.stop();
            console.log('Scanner kamera dinonaktifkan.');
          } catch (err) {
            console.error('Gagal menonaktifkan scanner:', err);
          }
        }
      };
      stopScanner();
    };
  }, [isCameraActive, santriList]);

  // Forms state
  const [evalTab, setEvalTab] = useState<string>('Jilid');
  const [showManualJilid, setShowManualJilid] = useState(false);
  const [showManualTahfidz, setShowManualTahfidz] = useState(false);
  
  // Jilid form
  const [jilidId, setJilidId] = useState('');
  const [jilidPage, setJilidPage] = useState<number>(1);
  const [jilidStatus, setJilidStatus] = useState<'Lulus' | 'Mengulang'>('Lulus');
  const [jilidNotes, setJilidNotes] = useState('');

  // Tahfidz form
  const [suratId, setSuratId] = useState('');
  const [ayatRange, setAyatRange] = useState('1-5');
  const [tahfidzStatus, setTahfidzStatus] = useState<'Lulus' | 'Mengulang'>('Lulus');
  const [tahfidzNotes, setTahfidzNotes] = useState('');

  // Ibadah & Custom Subjects dynamic categories
  const [activeCustomCategory, setActiveCustomCategory] = useState<string>('');
  const [ibadahItem, setIbadahItem] = useState('');
  const [ibadahStatus, setIbadahStatus] = useState<'Lulus' | 'Mengulang'>('Lulus');
  const [ibadahNotes, setIbadahNotes] = useState('');

  // Quick notes states for instant grading
  const [quickJilidNotes, setQuickJilidNotes] = useState('');
  const [quickTahfidzNotes, setQuickTahfidzNotes] = useState('');
  const [customMaterialNotes, setCustomMaterialNotes] = useState<Record<string, string>>({});

  // Auto-select first category of subject when changing tab or when ibadahMaterials changes
  useEffect(() => {
    const subjectMaterials = (ibadahMaterials || []).filter(m => {
      if (evalTab === 'Ibadah Praktis') {
        return !m.subject || m.subject === 'Ibadah Praktis';
      }
      return m.subject === evalTab;
    });
    const categories = Array.from(new Set(subjectMaterials.map(m => m.category)));
    if (categories.length > 0) {
      setActiveCustomCategory(categories[0]);
    } else {
      setActiveCustomCategory('');
    }
  }, [evalTab, ibadahMaterials]);

  // Check if an initial barcode is passed from dashboard
  useEffect(() => {
    if (initialScannedBarcode) {
      handleSearchBarcode(initialScannedBarcode);
      clearInitialBarcode();
    }
  }, [initialScannedBarcode]);

  // Load defaults when student changes
  useEffect(() => {
    if (selectedSantri) {
      // Get student's current progress for default form values
      const currentJilidLogs = capaianJilid.filter(l => l.santriId === selectedSantri.id);
      const latestJilidLog = currentJilidLogs.length > 0 
        ? currentJilidLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
        : null;

      if (latestJilidLog) {
        setJilidId(latestJilidLog.jilidId);
        setJilidPage(latestJilidLog.page + 1); // Auto increment page
      } else {
        setJilidId(jilidList[0]?.id || '');
        setJilidPage(1);
      }

      const currentTahfidzLogs = capaianTahfidz.filter(l => l.santriId === selectedSantri.id);
      const latestTahfidzLog = currentTahfidzLogs.length > 0 
        ? currentTahfidzLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
        : null;

      if (latestTahfidzLog) {
        setSuratId(latestTahfidzLog.suratId);
      } else {
        setSuratId(suratList[0]?.id || '');
      }

      setJilidNotes('');
      setTahfidzNotes('');
      setIbadahNotes('');
      setIbadahItem('');
      setQuickJilidNotes('');
      setQuickTahfidzNotes('');
      setCustomMaterialNotes({});
    }
  }, [selectedSantri]);

  const handleSearchBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Simulate scanning delay
    setIsScanning(true);
    setScanMessage(null);
    setSelectedSantri(null);

    setTimeout(() => {
      const found = santriList.find(
        s => s.barcode.toLowerCase() === cleanCode.toLowerCase() || s.id.toLowerCase() === cleanCode.toLowerCase()
      );

      setIsScanning(false);
      if (found) {
        setSelectedSantri(found);
        setBarcodeInput(found.barcode);
        playBeep(); // Bunyi beep saat berhasil memindai barcode!
        showTemporaryBanner('Barcode berhasil dipindai! Profil Santri termuat.');
      } else {
        setScanMessage('Barcode tidak ditemukan. Coba santri lain.');
      }
    }, 600);
  };

  const showTemporaryBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  const handleSaveJilid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    onAddJilidEvaluation({
      santriId: selectedSantri.id,
      jilidId,
      page: Number(jilidPage),
      status: jilidStatus,
      notes: jilidNotes || (jilidStatus === 'Lulus' ? 'Lancar dan baik' : 'Perlu diulang kembali'),
      ustadzId: 'U01' // Pre-mapped mock teacher Ahmad
    });

    showTemporaryBanner(`Evaluasi Jilid untuk ${selectedSantri.name} berhasil disimpan!`);
    setJilidNotes('');
    // Auto-update to next page
    setJilidPage(prev => prev + 1);
  };

  const handleSaveTahfidz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    onAddTahfidzEvaluation({
      santriId: selectedSantri.id,
      suratId,
      ayatRange,
      status: tahfidzStatus,
      notes: tahfidzNotes || (tahfidzStatus === 'Lulus' ? 'Hafalan lancar' : 'Murojaah lagi agar mantap'),
      ustadzId: 'U01'
    });

    showTemporaryBanner(`Evaluasi Tahfidz untuk ${selectedSantri.name} berhasil disimpan!`);
    setTahfidzNotes('');
  };

  const handleSaveIbadah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;
    if (!ibadahItem.trim()) {
      alert('Tuliskan nama praktik ibadah (misal: Praktik Wudhu).');
      return;
    }

    onAddIbadahEvaluation({
      santriId: selectedSantri.id,
      category: activeCustomCategory || 'Umum',
      item: ibadahItem.trim(),
      status: ibadahStatus,
      notes: ibadahNotes || (ibadahStatus === 'Lulus' ? 'Praktik baik dan benar' : 'Masih ada kesalahan gerakan'),
      ustadzId: 'U01',
      subject: evalTab
    });

    showTemporaryBanner(`Evaluasi Ibadah Praktis untuk ${selectedSantri.name} berhasil disimpan!`);
    setIbadahItem('');
    setIbadahNotes('');
  };

  // Get current active metrics of selected student
  const studentJilidLogs = selectedSantri ? capaianJilid.filter(l => l.santriId === selectedSantri.id) : [];
  const latestJilid = studentJilidLogs.length > 0 
    ? studentJilidLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
    : null;

  const studentTahfidzLogs = selectedSantri ? capaianTahfidz.filter(l => l.santriId === selectedSantri.id) : [];
  const latestTahfidz = studentTahfidzLogs.length > 0 
    ? studentTahfidzLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
    : null;

  const studentIbadahLogs = selectedSantri ? capaianIbadah.filter(l => l.santriId === selectedSantri.id) : [];

  const handleQuickSaveJilid = (tJilidId: string, tPage: number, tStatus: 'Lulus' | 'Mengulang', tNotes?: string) => {
    if (!selectedSantri) return;
    const finalNotes = quickJilidNotes.trim() || tNotes || (tStatus === 'Lulus' ? 'Lancar dan baik' : 'Perlu diulang kembali');
    onAddJilidEvaluation({
      santriId: selectedSantri.id,
      jilidId: tJilidId,
      page: tPage,
      status: tStatus,
      notes: finalNotes,
      ustadzId: 'U01'
    });
    setQuickJilidNotes('');
    showTemporaryBanner(`Capaian Jilid untuk ${selectedSantri.name} disimpan!`);
  };

  const handleQuickSaveTahfidz = (tSuratId: string, tAyatRange: string, tStatus: 'Lulus' | 'Mengulang', tNotes?: string) => {
    if (!selectedSantri) return;
    const finalNotes = quickTahfidzNotes.trim() || tNotes || (tStatus === 'Lulus' ? 'Hafalan lancar' : 'Murojaah lagi agar mantap');
    onAddTahfidzEvaluation({
      santriId: selectedSantri.id,
      suratId: tSuratId,
      ayatRange: tAyatRange,
      status: tStatus,
      notes: finalNotes,
      ustadzId: 'U01'
    });
    setQuickTahfidzNotes('');
    showTemporaryBanner(`Setoran Tahfidz untuk ${selectedSantri.name} disimpan!`);
  };

  const handleQuickSaveIbadah = (
    tCategory: string, 
    tItem: string, 
    tStatus: 'Lulus' | 'Mengulang', 
    tNotes?: string, 
    tSubject?: string,
    materialId?: string
  ) => {
    if (!selectedSantri) return;
    const finalNotes = (materialId && customMaterialNotes[materialId]?.trim()) || tNotes || (tStatus === 'Lulus' ? 'Praktik baik dan benar' : 'Masih ada kesalahan gerakan');
    onAddIbadahEvaluation({
      santriId: selectedSantri.id,
      category: tCategory,
      item: tItem,
      status: tStatus,
      notes: finalNotes,
      ustadzId: 'U01',
      subject: tSubject
    });
    if (materialId) {
      setCustomMaterialNotes(prev => {
        const copy = { ...prev };
        delete copy[materialId];
        return copy;
      });
    }
    showTemporaryBanner(`Evaluasi ${tSubject || 'Ibadah'} untuk ${selectedSantri.name} disimpan!`);
  };

  // Suggest next Jilid
  const getJilidSuggestion = () => {
    if (!selectedSantri) return null;
    
    if (!latestJilid) {
      return {
        jilidId: jilidList[0]?.id || 'J01',
        name: jilidList[0]?.name || 'Jilid 1',
        page: 1,
        type: 'NEW' as const
      };
    }

    const currentIndex = jilidList.findIndex(j => j.id === latestJilid.jilidId);
    const currentJilid = jilidList[currentIndex] || jilidList[0];

    if (latestJilid.status === 'Mengulang') {
      return {
        jilidId: latestJilid.jilidId,
        name: currentJilid?.name || 'Jilid',
        page: latestJilid.page,
        type: 'RETRY' as const
      };
    }

    // Auto increment page
    const nextPage = latestJilid.page + 1;
    if (currentJilid && nextPage > currentJilid.totalPages) {
      // Suggest next Jilid
      const nextJilid = jilidList[currentIndex + 1];
      if (nextJilid) {
        return {
          jilidId: nextJilid.id,
          name: nextJilid.name,
          page: 1,
          type: 'UPGRADE' as const
        };
      } else {
        // No next Jilid, stay at last
        return {
          jilidId: latestJilid.jilidId,
          name: currentJilid.name,
          page: latestJilid.page,
          type: 'FINISHED' as const
        };
      }
    }

    return {
      jilidId: latestJilid.jilidId,
      name: currentJilid?.name || 'Jilid',
      page: nextPage,
      type: 'NEXT_PAGE' as const
    };
  };

  const jilidSuggestion = getJilidSuggestion();

  // Suggest next Tahfidz Surat and Ayat
  const getTahfidzSuggestion = () => {
    if (!selectedSantri) return null;

    if (!latestTahfidz) {
      const firstSurah = suratList[0] || { id: 'SR01', name: 'An-Nas', totalAyat: 6 };
      return {
        suratId: firstSurah.id,
        name: firstSurah.name,
        ayatRange: '1-5',
        type: 'NEW' as const
      };
    }

    const currentSurah = suratList.find(s => s.id === latestTahfidz.suratId) || suratList[0] || { id: 'SR01', name: 'An-Nas', totalAyat: 6 };

    if (latestTahfidz.status === 'Mengulang') {
      return {
        suratId: latestTahfidz.suratId,
        name: currentSurah.name,
        ayatRange: latestTahfidz.ayatRange,
        type: 'RETRY' as const
      };
    }

    // Suggest next ayat range
    const range = latestTahfidz.ayatRange;
    const parts = range.split('-');
    let start = 1;
    let end = 5;
    if (parts.length === 2) {
      start = parseInt(parts[0]) || 1;
      end = parseInt(parts[1]) || 5;
    } else if (parts.length === 1) {
      end = parseInt(parts[0]) || 5;
    }

    const step = (end - start + 1) || 5;
    const nextStart = end + 1;

    if (nextStart > currentSurah.totalAyat) {
      // Completed current Surah, suggest next Surah
      const currentIndex = suratList.findIndex(s => s.id === currentSurah.id);
      const nextSurah = suratList[currentIndex + 1];
      if (nextSurah) {
        return {
          suratId: nextSurah.id,
          name: nextSurah.name,
          ayatRange: `1-${Math.min(5, nextSurah.totalAyat)}`,
          type: 'NEXT_SURAH' as const,
          prevName: currentSurah.name
        };
      } else {
        return {
          suratId: currentSurah.id,
          name: currentSurah.name,
          ayatRange: latestTahfidz.ayatRange,
          type: 'FINISHED' as const
        };
      }
    }

    const nextEnd = Math.min(end + step, currentSurah.totalAyat);
    return {
      suratId: currentSurah.id,
      name: currentSurah.name,
      ayatRange: `${nextStart}-${nextEnd}`,
      type: 'NEXT_AYAT' as const
    };
  };

  const tahfidzSuggestion = getTahfidzSuggestion();

  return (
    <div className="space-y-6">
      
      {/* Toast Banner */}
      {successBanner && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-500 p-4 text-white shadow-xl animate-bounce">
          <CheckCircle2 size={24} />
          <div>
            <p className="text-sm font-bold">Berhasil Disinkronkan!</p>
            <p className="text-xs text-emerald-100">{successBanner}</p>
          </div>
        </div>
      )}

      {/* Main scanning box and simulator */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Scanner Simulation Control Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-md font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <Camera className="text-emerald-600 dark:text-emerald-400" size={18} />
            Kamera Barcode Scanner
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Pemindaian barcode fisik santri secara real-time via kamera perangkat.
          </p>

          {/* Toggle Camera Activation Button */}
          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer shadow-xs ${
              isCameraActive 
                ? 'bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600'
            }`}
          >
            <Camera size={14} />
            {isCameraActive ? 'Matikan Kamera Scanner' : 'Aktifkan Kamera Scan'}
          </button>

          {/* Visual camera scan simulation frame */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950 flex flex-col items-center justify-center border-4 border-slate-900 shadow-inner">
            
            {/* HTML5 camera video container using html5-qrcode */}
            <div 
              id="camera-reader" 
              className={`absolute inset-0 w-full h-full z-0 overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Green pulsing scan lines */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-emerald-500 shadow-md shadow-emerald-400/50 animate-pulse z-10" />
            <div className="absolute inset-0 border-2 border-emerald-500/20 m-8 animate-pulse rounded-lg z-10" />
            
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 h-6 w-6 border-t-4 border-l-4 border-emerald-500 z-10" />
            <div className="absolute top-4 right-4 h-6 w-6 border-t-4 border-r-4 border-emerald-500 z-10" />
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-4 border-l-4 border-emerald-500 z-10" />
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-4 border-r-4 border-emerald-500 z-10" />

            {isScanning ? (
              <div className="text-center text-white z-20 space-y-2 bg-slate-950/70 p-4 rounded-xl backdrop-blur-xs">
                <QrCode className="mx-auto text-emerald-400 animate-spin" size={48} />
                <p className="text-xs font-bold tracking-wider uppercase text-emerald-400">Membaca Kode...</p>
              </div>
            ) : selectedSantri ? (
              <div className="text-center text-white z-20 p-4 bg-slate-900/90 rounded-xl border border-white/10 backdrop-blur-xs max-w-[85%]">
                <Check className="mx-auto text-emerald-500 bg-emerald-950/80 p-2 rounded-full border border-emerald-500 mb-2" size={36} />
                <p className="text-xs font-semibold text-slate-300">Barcode Terverifikasi</p>
                <p className="font-bold text-sm truncate mt-0.5">{selectedSantri.name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedSantri.barcode}</p>
              </div>
            ) : !isCameraActive ? (
              <div className="text-center text-slate-400 z-10 p-4 space-y-3">
                <QrCode className="mx-auto text-slate-500 animate-pulse" size={42} />
                <p className="text-xs font-bold text-slate-300">Kamera Scanner Nonaktif</p>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold uppercase hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <Camera size={12} /> Buka Kamera
                </button>
              </div>
            ) : (
              <div className="text-center text-white z-10 p-4 bg-slate-950/40 rounded-xl max-w-[85%]">
                <QrCode className="mx-auto mb-2 text-emerald-400 animate-pulse" size={42} />
                <p className="text-xs font-bold text-white">Kamera Berhasil Terbuka!</p>
                <p className="text-[9px] text-slate-200 mt-1 leading-relaxed">
                  Arahkan barcode fisik santri ke depan kamera, atau klik list simulasi di bawah untuk pencarian instant.
                </p>
              </div>
            )}
          </div>

          {/* Quick manual search entry */}
          <div className="mt-4 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block dark:text-slate-400">Input ID / Cari Manual</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ID / Barcode (cth: SANTRI-001)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-8 text-xs font-semibold outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchBarcode(barcodeInput)}
                />
                <button
                  onClick={() => handleSearchBarcode(barcodeInput)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>
            {scanMessage && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {scanMessage}
              </p>
            )}
          </div>

          {/* Quick select simulator buttons */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Simulasi Klik Scan Cepat:</span>
            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
              {santriList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSearchBarcode(s.barcode)}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className="font-semibold truncate max-w-[150px]">{s.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{s.barcode}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Evaluation Panel Content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSantri ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              
              {/* Loaded student profile header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedSantri.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Rombel: {kelasList.find(k => k.id === selectedSantri.kelasId)?.name || '-'}
                      </span>
                      <span>•</span>
                      <span>TTL: {selectedSantri.birthPlace}, {new Date(selectedSantri.birthDate).toLocaleDateString('id-ID', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                    </div>
                  </div>
                </div>

                {/* Print Barcode Badge visual */}
                <div className="rounded-lg bg-slate-100 p-2 flex items-center gap-2 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <QrCode size={24} className="text-slate-800 dark:text-slate-200" />
                  <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    <p className="font-bold uppercase tracking-wider">Cetak Barcode</p>
                    <p className="font-semibold text-slate-400">{selectedSantri.barcode}</p>
                  </div>
                </div>
              </div>

              {/* Multi-subject current status tabs */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-5 bg-slate-50 p-1 rounded-xl dark:bg-slate-800/50">
                {(subjectsList && subjectsList.length > 0 ? subjectsList : ['Jilid', 'Tahfidz', 'Ibadah Praktis']).map((subject) => {
                  const isActive = evalTab.toLowerCase() === subject.toLowerCase();
                  return (
                    <button
                      key={subject}
                      onClick={() => setEvalTab(subject)}
                      type="button"
                      className={`flex flex-col items-center sm:flex-row justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400 font-extrabold' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium'
                      }`}
                    >
                      {subject === 'Jilid' && <BookOpen size={14} />}
                      {subject === 'Tahfidz' && <Award size={14} />}
                      {subject === 'Ibadah Praktis' && <CheckSquare size={14} />}
                      {!['Jilid', 'Tahfidz', 'Ibadah Praktis'].includes(subject) && <BookMarked size={14} />}
                      <span>{subject}</span>
                    </button>
                  );
                })}
              </div>

              {/* --------------------- TAB 1: JILID EVALUATION --------------------- */}
              {evalTab.toLowerCase() === 'jilid' && (
                <div className="mt-5 space-y-5 animate-fadeIn">
                  
                  {/* Current achievement display */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Capaian Jilid Terakhir:</h4>
                    {latestJilid ? (
                      <div className="mt-2 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {jilidList.find(j => j.id === latestJilid.jilidId)?.name || 'Jilid'} - Halaman {latestJilid.page}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">"{latestJilid.notes}"</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          latestJilid.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {latestJilid.status}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">Santri ini belum memiliki riwayat evaluasi Jilid. Silakan daftarkan capaian pertamanya di bawah.</p>
                    )}
                  </div>

                  {/* Ustadz Automatic Grading Panel */}
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-5 dark:border-indigo-950/30 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">⚡ ASISTEN PENILAIAN JILID</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Satu klik untuk simpan evaluasi hari ini</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowManualJilid(!showManualJilid)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                      >
                        {showManualJilid ? "← Kembali ke Asisten" : "⚙️ Sesuaikan Manual"}
                      </button>
                    </div>

                    {!showManualJilid ? (
                      <div className="space-y-4">
                        {jilidSuggestion && (
                          <>
                            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-xs dark:bg-slate-950 dark:border-slate-800">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rekomendasi Pembelajaran Hari Ini:</p>
                              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                                {jilidSuggestion.name} — Halaman <span className="text-indigo-600 dark:text-indigo-400">{jilidSuggestion.page}</span>
                              </h3>
                              <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
                                {jilidSuggestion.type === 'NEW' && '📖 Capaian Pertama'}
                                {jilidSuggestion.type === 'RETRY' && '🔁 Mengulang pembelajaran sebelumnya'}
                                {jilidSuggestion.type === 'NEXT_PAGE' && '➡️ Halaman berikutnya'}
                                {jilidSuggestion.type === 'UPGRADE' && '🎉 Rekomendasi Naik Jilid Baru!'}
                                {jilidSuggestion.type === 'FINISHED' && '🎓 Sudah menyelesaikan semua jilid!'}
                              </span>
                            </div>

                            {/* Custom notes for instant grading */}
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs dark:bg-slate-950 dark:border-slate-800">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 dark:text-slate-400">
                                Catatan Evaluasi Ustadz (Opsional)
                              </label>
                              <input
                                type="text"
                                placeholder="Tulis catatan khusus untuk halaman ini..."
                                value={quickJilidNotes}
                                onChange={(e) => setQuickJilidNotes(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Action grading buttons */}
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              <button
                                type="button"
                                onClick={() => handleQuickSaveJilid(jilidSuggestion.jilidId, jilidSuggestion.page, 'Lulus', 'Lancar & sangat baik')}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs group"
                              >
                                <span className="text-xs font-bold">Lulus & Lanjut</span>
                                <span className="text-[9px] text-emerald-100 mt-0.5 group-hover:scale-105 transition-transform">Ke hal. {jilidSuggestion.page + 1}</span>
                              </button>

                              {jilidSuggestion.type === 'UPGRADE' || jilidSuggestion.page > 5 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Find next Jilid in list if possible
                                    const nextJ = jilidList[jilidList.findIndex(j => j.id === jilidSuggestion.jilidId) + 1] || jilidList[0];
                                    handleQuickSaveJilid(nextJ.id, 1, 'Lulus', 'Alhamdulillah LULUS & NAIK JILID!');
                                  }}
                                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs group"
                                >
                                  <span className="text-xs font-bold">Lulus & Naik Jilid</span>
                                  <span className="text-[9px] text-indigo-100 mt-0.5">Ke jilid berikutnya</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickSaveJilid(jilidSuggestion.jilidId, jilidSuggestion.page, 'Lulus', 'Lulus lancar')}
                                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition-all cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs font-bold">Selesai Halaman Ini</span>
                                  <span className="text-[9px] text-slate-200 mt-0.5">Berhasil dilewati</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleQuickSaveJilid(jilidSuggestion.jilidId, jilidSuggestion.page, 'Mengulang', 'Masih mengeja, perlu dilancarkan ketukannya')}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs group"
                              >
                                <span className="text-xs font-bold">Belum Lancar</span>
                                <span className="text-[9px] text-amber-100 mt-0.5">Mengulang hal. {jilidSuggestion.page}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Manual Form for Jilid */
                      <form onSubmit={handleSaveJilid} className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Pilih Jilid</label>
                            <select
                              value={jilidId}
                              onChange={(e) => setJilidId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              required
                            >
                              <option value="">-- Pilih --</option>
                              {jilidList.map((j) => (
                                <option key={j.id} value={j.id}>{j.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Kelulusan Halaman</label>
                            <input
                              type="number"
                              min="1"
                              max={jilidList.find(j => j.id === jilidId)?.totalPages || 100}
                              value={jilidPage}
                              onChange={(e) => setJilidPage(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Status Evaluasi Halaman</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer dark:text-slate-300">
                              <input
                                type="radio"
                                name="jilid_status"
                                checked={jilidStatus === 'Lulus'}
                                onChange={() => setJilidStatus('Lulus')}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              Lulus & Lanjut Halaman
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer dark:text-slate-300">
                              <input
                                type="radio"
                                name="jilid_status"
                                checked={jilidStatus === 'Mengulang'}
                                onChange={() => setJilidStatus('Mengulang')}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              Mengulang Halaman Ini
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Catatan Khusus Ustadz</label>
                          <textarea
                            rows={2}
                            placeholder="Misal: Makhraj makhraj huruf bertanda tasydid sudah oke, pertahankan ketukan tajwidnya."
                            value={jilidNotes}
                            onChange={(e) => setJilidNotes(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-3 text-xs outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                        >
                          <Sparkles size={14} /> Simpan Capaian Jilid Santri (Manual)
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* --------------------- TAB 2: TAHFIDZ EVALUATION --------------------- */}
              {evalTab.toLowerCase() === 'tahfidz' && (
                <div className="mt-5 space-y-5 animate-fadeIn">
                  
                  {/* Current achievement display */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Capaian Tahfidz Terakhir:</h4>
                    {latestTahfidz ? (
                      <div className="mt-2 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            QS. {suratList.find(s => s.id === latestTahfidz.suratId)?.name || 'Surat'} (Ayat {latestTahfidz.ayatRange})
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">"{latestTahfidz.notes}"</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          latestTahfidz.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {latestTahfidz.status}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">Santri ini belum memiliki riwayat setoran hafalan Tahfidz.</p>
                    )}
                  </div>

                  {/* Ustadz Automatic Tahfidz Assistant */}
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/10 p-5 dark:border-teal-950/30 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-wider">⚡ ASISTEN SETORAN TAHFIDZ</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Satu klik untuk simpan kelulusan setoran hari ini</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowManualTahfidz(!showManualTahfidz)}
                        className="text-[10px] font-bold text-teal-600 hover:underline dark:text-teal-400 cursor-pointer"
                      >
                        {showManualTahfidz ? "← Kembali ke Asisten" : "⚙️ Sesuaikan Manual"}
                      </button>
                    </div>

                    {!showManualTahfidz ? (
                      <div className="space-y-4">
                        {tahfidzSuggestion && (
                          <>
                            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-xs dark:bg-slate-950 dark:border-slate-800">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rekomendasi Setoran Hari Ini:</p>
                              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                                QS. {tahfidzSuggestion.name} — Ayat <span className="text-teal-600 dark:text-teal-400">{tahfidzSuggestion.ayatRange}</span>
                              </h3>
                              <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
                                {tahfidzSuggestion.type === 'NEW' && '📖 Setoran pertama untuk santri ini'}
                                {tahfidzSuggestion.type === 'RETRY' && '🔁 Mengulang setoran ayat sebelumnya'}
                                {tahfidzSuggestion.type === 'NEXT_AYAT' && '➡️ Melanjutkan ayat berikutnya'}
                                {tahfidzSuggestion.type === 'NEXT_SURAH' && `🎉 Selesai surat ${tahfidzSuggestion.prevName || ''}, lanjut surat baru!`}
                                {tahfidzSuggestion.type === 'FINISHED' && '🎓 Subhanallah, sudah menyelesaikan semua surat!'}
                              </span>
                            </div>

                            {/* Custom notes for instant grading */}
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs dark:bg-slate-950 dark:border-slate-800">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 dark:text-slate-400">
                                Catatan Evaluasi Ustadz (Opsional)
                              </label>
                              <input
                                type="text"
                                placeholder="Tulis catatan makhraj, tajwid, atau kelancaran..."
                                value={quickTahfidzNotes}
                                onChange={(e) => setQuickTahfidzNotes(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              <button
                                type="button"
                                onClick={() => handleQuickSaveTahfidz(tahfidzSuggestion.suratId, tahfidzSuggestion.ayatRange, 'Lulus', 'Lancar, tajwid & makhraj sangat baik')}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all cursor-pointer shadow-xs group"
                              >
                                <span className="text-xs font-bold">Lulus & Lanjut</span>
                                <span className="text-[9px] text-teal-100 mt-0.5">Simpan kelulusan ayat</span>
                              </button>

                              {tahfidzSuggestion.type === 'NEXT_SURAH' ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickSaveTahfidz(tahfidzSuggestion.suratId, tahfidzSuggestion.ayatRange, 'Lulus', 'Lulus Surat, naik ke Surat Baru!')}
                                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-xs group"
                                >
                                  <span className="text-xs font-bold">Naik Surat Baru</span>
                                  <span className="text-[9px] text-indigo-100 mt-0.5">QS. {tahfidzSuggestion.name}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickSaveTahfidz(tahfidzSuggestion.suratId, tahfidzSuggestion.ayatRange, 'Lulus', 'Lancar baik')}
                                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition-all cursor-pointer shadow-xs"
                                >
                                  <span className="text-xs font-bold">Lulus (Lancar)</span>
                                  <span className="text-[9px] text-slate-200 mt-0.5">Tanpa revisi</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleQuickSaveTahfidz(tahfidzSuggestion.suratId, tahfidzSuggestion.ayatRange, 'Mengulang', 'Masih terbata-bata, perlu diulang mandiri di rumah')}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs group"
                              >
                                <span className="text-xs font-bold">Mengulang Ayat</span>
                                <span className="text-[9px] text-amber-100 mt-0.5">Ulang ayat {tahfidzSuggestion.ayatRange}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Manual Form for Tahfidz */
                      <form onSubmit={handleSaveTahfidz} className="space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Pilih Surat</label>
                            <select
                              value={suratId}
                              onChange={(e) => setSuratId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              required
                            >
                              <option value="">-- Pilih --</option>
                              {suratList.map((s) => (
                                <option key={s.id} value={s.id}>QS. {s.name} ({s.totalAyat} ayat)</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Rentang Ayat Kelulusan</label>
                            <input
                              type="text"
                              placeholder="cth: 1-5"
                              value={ayatRange}
                              onChange={(e) => setAyatRange(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Status Kelulusan Ayat</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer dark:text-slate-300">
                              <input
                                type="radio"
                                name="tahfidz_status"
                                checked={tahfidzStatus === 'Lulus'}
                                onChange={() => setTahfidzStatus('Lulus')}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              Lulus & Tambah Hafalan
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer dark:text-slate-300">
                              <input
                                type="radio"
                                name="tahfidz_status"
                                checked={tahfidzStatus === 'Mengulang'}
                                onChange={() => setTahfidzStatus('Mengulang')}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              Belum Lancar (Mengulang)
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Catatan Khusus Tahfidz</label>
                          <textarea
                            rows={2}
                            placeholder="Misal: Hafalan lancar sekali, dengung ghunnah di ayat 3 agar dipanjangkan."
                            value={tahfidzNotes}
                            onChange={(e) => setTahfidzNotes(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-3 text-xs outline-hidden focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-teal-700"
                        >
                          <Sparkles size={14} /> Simpan Setoran Hafalan Tahfidz (Manual)
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* --------------------- DYNAMIC CURRICULUM SUBJECT EVALUATION --------------------- */}
              {!['Jilid', 'Tahfidz'].some(s => s.toLowerCase() === evalTab.toLowerCase()) && (
                <div className="mt-5 space-y-5 animate-fadeIn">
                  
                  {/* Info Header */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 dark:bg-slate-950/25 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      📋 Kurikulum {evalTab}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Wali Kelas/Admin mengelola materi kurikulum. Ustadz tinggal melihat materi yang sudah ada di bawah dan mengklik tombol lulus instan untuk memberi penilaian setelah praktik selesai.
                    </p>
                  </div>

                  {/* Sub-tabs for Subject Categories */}
                  {(() => {
                    const subjectMaterials = (ibadahMaterials || []).filter(m => {
                      if (evalTab === 'Ibadah Praktis') {
                        return !m.subject || m.subject === 'Ibadah Praktis';
                      }
                      return m.subject === evalTab;
                    });
                    const categories = Array.from(new Set(subjectMaterials.map(m => m.category)));
                    const activeCat = categories.includes(activeCustomCategory) 
                      ? activeCustomCategory 
                      : (categories[0] || '');

                    const filteredMaterials = subjectMaterials.filter(m => m.category === activeCat);

                    return (
                      <>
                        {categories.length > 0 ? (
                          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 dark:bg-slate-950 overflow-x-auto">
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCustomCategory(cat)}
                                className={`flex-1 min-w-[80px] py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                  activeCat === cat 
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {/* Predefined Curriculum Interactive Rows */}
                        <div className="space-y-3">
                          {filteredMaterials.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {filteredMaterials.map((material) => {
                                // Find latest evaluation for this student and this material
                                const materialLogs = studentIbadahLogs.filter(log => log.item.toLowerCase() === material.name.toLowerCase());
                                const latestLog = materialLogs.length > 0 
                                  ? materialLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
                                  : null;

                                return (
                                  <div 
                                    key={material.id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-xs dark:bg-slate-950 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all"
                                  >
                                    <div className="flex-1">
                                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{material.name}</h5>
                                      {material.description && (
                                        <p className="text-[11px] text-slate-400 mt-0.5">{material.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="text-[10px] bg-slate-100 font-mono text-slate-400 font-bold px-1.5 py-0.5 rounded-sm dark:bg-slate-900 dark:text-slate-500">
                                          ID: {material.id}
                                        </span>
                                        {latestLog ? (
                                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                            latestLog.status === 'Lulus' 
                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                          }`}>
                                            {latestLog.status === 'Lulus' ? '✓ Lulus' : '⚠ Perlu Diulang'}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                                            Belum Dinilai
                                          </span>
                                        )}
                                      </div>

                                      {/* Custom notes input for this curriculum material */}
                                      <div className="mt-2.5">
                                        <input
                                          type="text"
                                          placeholder="Tulis catatan penilaian khusus di sini (opsional)..."
                                          value={customMaterialNotes[material.id] || ''}
                                          onChange={(e) => setCustomMaterialNotes({
                                            ...customMaterialNotes,
                                            [material.id]: e.target.value
                                          })}
                                          className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-[11px] font-medium outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        />
                                      </div>
                                    </div>

                                    {/* Direct action buttons for instant grading */}
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleQuickSaveIbadah(activeCat || material.category, material.name, 'Lulus', undefined, evalTab, material.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                                      >
                                        <Check size={12} /> Lulus Sempurna
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickSaveIbadah(activeCat || material.category, material.name, 'Mengulang', undefined, evalTab, material.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-xs"
                                      >
                                        Mengulang
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic text-center py-6">
                              Tidak ada materi kurikulum untuk kategori {activeCat || 'ini'} di database.
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <QrCode className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={64} />
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Belum Ada Profil Santri Terpilih</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                Silakan scan barcode santri menggunakan panel simulator kamera di samping kiri atau pilih klik simulasi cepat.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
