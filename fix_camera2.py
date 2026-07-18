import re

with open('tpqkita-php/scanner.php', 'r') as f:
    content = f.read()

# Replace the entire script block for camera setup
script_start = "    let html5QrCode = null;"
script_end = "    function stopScanning() {\n        return new Promise((resolve) => {\n            if (html5QrCode) {\n                html5QrCode.stop().then(() => {\n                    document.getElementById('btn-start').disabled = false;\n                    document.getElementById('btn-stop').disabled = true;\n                    html5QrCode.clear();\n                    html5QrCode = null;\n                    resolve();\n                }).catch(err => {\n                    console.error('Error stopping camera: ', err);\n                    resolve();\n                });\n            } else {\n                resolve();\n            }\n        });\n    }"

# In case the exact text matching fails, we will use regex to replace between `let html5QrCode = null;` and `function stopScanning() { ... }`
# Wait, let's just do a regex replace for the whole <script> tags for the camera part.

script_regex = re.compile(r'<script>\s*let html5QrCode = null;.*?</script>', re.DOTALL)

new_script = '''<script>
    let html5QrCode = null;
    let cameraDevices = [];

    document.addEventListener('DOMContentLoaded', () => {
        setupCameraDevices();
        
        document.getElementById('btn-start').addEventListener('click', startScanning);
        document.getElementById('btn-stop').addEventListener('click', () => stopScanning());
        
        // Auto-restart if camera changed
        document.getElementById('camera-select').addEventListener('change', () => {
            if (html5QrCode && html5QrCode.isScanning) {
                stopScanning().then(() => startScanning());
            }
        });
    });

    function playBeepSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 1320;
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.16);
        } catch (err) {
            console.error('Audio synthesizer error: ', err);
        }
    }

    function setupCameraDevices() {
        // If the browser doesn't support mediaDevices, warn user
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            document.getElementById('camera-select').innerHTML = '<option value="">Akses Kamera tidak didukung (Gunakan HTTPS)</option>';
            return;
        }

        Html5Qrcode.getCameras().then(devices => {
            const select = document.getElementById('camera-select');
            select.innerHTML = '';
            
            if (devices && devices.length > 0) {
                cameraDevices = devices;
                let backCamId = null;
                devices.forEach((device, index) => {
                    const opt = document.createElement('option');
                    opt.value = device.id;
                    opt.text = device.label || 'Kamera ' + (index + 1);
                    if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('belakang') || device.label.toLowerCase().includes('rear')) {
                        backCamId = device.id;
                    }
                    select.appendChild(opt);
                });
                if (backCamId) {
                    select.value = backCamId;
                }
            } else {
                select.innerHTML = '<option value="">Tidak ada kamera ditemukan</option>';
            }
        }).catch(err => {
            console.error('Kamera permission error: ', err);
            document.getElementById('camera-select').innerHTML = '<option value="">Pilih kamera (Default)</option>';
        });
    }

    function startScanning() {
        const select = document.getElementById('camera-select');
        let cameraId = select.value;
        
        // Setup configuration properly for mobile
        const config = {
            fps: 15,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
                let minEdgePercentage = 0.7; // 70%
                let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
                return {
                    width: qrboxSize,
                    height: qrboxSize
                };
            }
        };

        // If no camera ID is found (e.g. permission not granted yet), fallback to environment camera
        let cameraConfig = cameraId ? cameraId : { facingMode: "environment" };

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }
        
        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-stop').disabled = false;

        html5QrCode.start(
            cameraConfig, 
            config,
            (decodedText, decodedResult) => {
                // SUCCESS SCAN CALLBACK
                playBeepSound();
                stopScanning();
                
                fetchStudentByBarcode(decodedText);
            },
            (errorMessage) => {
                // silent scanning logic
            }
        ).then(() => {
            // After successful start, if we didn't have cameras populated, try populating again
            if (cameraDevices.length === 0) {
                setupCameraDevices();
            }
        }).catch(err => {
            console.error('Camera Error: ', err);
            
            // Check if it's an insecure context (HTTP instead of HTTPS)
            if (window.isSecureContext === false) {
                alert('Akses kamera diblokir. Harap akses aplikasi ini menggunakan HTTPS agar kamera dapat berfungsi.');
            } else {
                alert('Gagal menyalakan kamera. Pastikan browser memiliki izin mengakses kamera.');
            }
            
            document.getElementById('btn-start').disabled = false;
            document.getElementById('btn-stop').disabled = true;
        });
    }

    function stopScanning() {
        return new Promise((resolve) => {
            if (html5QrCode) {
                try {
                    html5QrCode.stop().then(() => {
                        document.getElementById('btn-start').disabled = false;
                        document.getElementById('btn-stop').disabled = true;
                        html5QrCode.clear();
                        html5QrCode = null;
                        resolve();
                    }).catch(err => {
                        console.error('Error stopping camera: ', err);
                        resolve();
                    });
                } catch(e) {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }

    function fetchStudentByBarcode(barcodeStr) {
        if (!barcodeStr) return;
        
        const placeholder = document.getElementById('result-placeholder');
        placeholder.innerHTML = '<h4>Mengambil data profil santri...</h4>';
        placeholder.classList.remove('hidden');
        document.getElementById('profile-pane').classList.add('hidden');

        fetch('scanner.php?ajax_fetch=1&barcode=' + encodeURIComponent(barcodeStr))
            .then(res => res.json())
            .then(data => {
                if (data && data.success) {
                    document.getElementById('form-stu-id').value = data.santri.id;
                    document.getElementById('stu-name').innerText = data.santri.name;
                    document.getElementById('stu-barcode').innerText = data.santri.barcode;
                    document.getElementById('stu-class').innerText = data.santri.nama_kelas || 'Siswa Baru';
                    document.getElementById('stu-avatar').innerText = data.santri.name.substring(0,1);

                    document.getElementById('stu-last-jilid').innerText = data.santri.last_jilid || 'Belum ada data';
                    document.getElementById('stu-target').innerText = data.santri.target || 'Belum ada data';
                    document.getElementById('stu-history').innerHTML = data.santri.history || 'Belum ada histori';

                    placeholder.classList.add('hidden');
                    document.getElementById('profile-pane').classList.remove('hidden');
                } else {
                    placeholder.innerHTML = `<h4 class="text-red-500 font-bold">Santri Tidak Ditemukan</h4><p class="text-xs">Barcode "${barcodeStr}" tidak terdaftar di sistem.</p>`;
                }
            })
            .catch(err => {
                placeholder.innerHTML = '<h4 class="text-red-500">Error</h4><p class="text-xs">' + err.message + '</p>';
            });
    }

    function selectEvalTab(tabName) {
        document.querySelectorAll('.eval-tab-btn').forEach(btn => {
            btn.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
            btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
        });
        document.getElementById('tab-' + tabName).classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        document.getElementById('tab-' + tabName).classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

        document.querySelectorAll('.eval-sub-pane').forEach(pane => {
            pane.classList.add('hidden');
        });
        document.getElementById('pane-' + tabName).classList.remove('hidden');
        document.getElementById('form-eval-type').value = tabName;
    }

    function cancelGrading() {
        document.getElementById('profile-pane').classList.add('hidden');
        document.getElementById('result-placeholder').classList.remove('hidden');
        document.getElementById('result-placeholder').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-14 h-14 text-slate-300 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <div class="space-y-1">
                <h4 class="font-extrabold text-sm text-slate-600">Siap Menerima Scan</h4>
                <p class="text-xs text-slate-400 max-w-sm mx-auto">Silakan posisikan kartu santri di depan lensa kamera. Profil santri serta formulir penilaian akan terbuka di sini secara otomatis.</p>
            </div>
        `;
    }
</script>'''

content = script_regex.sub(new_script, content)

with open('tpqkita-php/scanner.php', 'w') as f:
    f.write(content)

