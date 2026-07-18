import re

with open('tpqkita-php/scanner.php', 'r') as f:
    content = f.read()

setup_camera_old = '''    function setupCameraDevices() {
        Html5Qrcode.getCameras().then(devices => {
            const select = document.getElementById('camera-select');
            select.innerHTML = '';
            
            if (devices && devices.length > 0) {
                cameraDevices = devices;
                devices.forEach((device, index) => {
                    const opt = document.createElement('option');
                    opt.value = device.id;
                    opt.text = device.label || 'Kamera ' + (index + 1);
                    select.appendChild(opt);
                });
                document.getElementById('btn-start').addEventListener('click', startScanning);
                document.getElementById('btn-stop').addEventListener('click', stopScanning);
            } else {
                select.innerHTML = '<option value="">Tidak ada kamera ditemukan</option>';
            }
        }).catch(err => {
            console.error('Kamera permission error: ', err);
            document.getElementById('camera-select').innerHTML = '<option value="">Izin kamera diblokir</option>';
        });
    }'''

setup_camera_new = '''    function setupCameraDevices() {
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
                
                // Allow restarting scanner when camera is changed
                select.addEventListener('change', () => {
                    if (html5QrCode && html5QrCode.isScanning) {
                        stopScanning().then(() => startScanning());
                    }
                });

                document.getElementById('btn-start').addEventListener('click', startScanning);
                document.getElementById('btn-stop').addEventListener('click', () => stopScanning());
            } else {
                select.innerHTML = '<option value="">Tidak ada kamera ditemukan</option>';
            }
        }).catch(err => {
            console.error('Kamera permission error: ', err);
            document.getElementById('camera-select').innerHTML = '<option value="">Izin kamera diblokir</option>';
        });
    }'''

start_scan_old = '''    function startScanning() {
        const select = document.getElementById('camera-select');
        const cameraId = select.value;
        if (!cameraId) return;

        html5QrCode = new Html5Qrcode("reader");
        
        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-stop').disabled = false;

        html5QrCode.start(
            cameraId, 
            {
                fps: 15,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                // SUCCESS SCAN CALLBACK
                playBeepSound();
                stopScanning();
                
                // Fetch student profile using barcode string
                fetchStudentByBarcode(decodedText);
            },
            (errorMessage) => {
                // silent scanning logic
            }
        ).catch(err => {
            alert('Gagal menyalakan kamera: ' + err);
            document.getElementById('btn-start').disabled = false;
            document.getElementById('btn-stop').disabled = true;
        });
    }

    /**
     * Halts camera feeds
     */
    function stopScanning() {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                document.getElementById('btn-start').disabled = false;
                document.getElementById('btn-stop').disabled = true;
                html5QrCode = null;
            }).catch(err => {
                console.error('Error stopping camera: ', err);
            });
        }
    }'''

start_scan_new = '''    function startScanning() {
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

        let cameraConfig = cameraId ? cameraId : { facingMode: "environment" };

        html5QrCode = new Html5Qrcode("reader");
        
        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-stop').disabled = false;

        html5QrCode.start(
            cameraConfig, 
            config,
            (decodedText, decodedResult) => {
                // SUCCESS SCAN CALLBACK
                playBeepSound();
                stopScanning();
                
                // Fetch student profile using barcode string
                fetchStudentByBarcode(decodedText);
            },
            (errorMessage) => {
                // silent scanning logic
            }
        ).catch(err => {
            console.error('Camera Error: ', err);
            alert('Gagal menyalakan kamera. Pastikan izin kamera diberikan.');
            document.getElementById('btn-start').disabled = false;
            document.getElementById('btn-stop').disabled = true;
            html5QrCode = null;
        });
    }

    /**
     * Halts camera feeds
     */
    function stopScanning() {
        return new Promise((resolve) => {
            if (html5QrCode) {
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
            } else {
                resolve();
            }
        });
    }'''

content = content.replace(setup_camera_old, setup_camera_new)
content = content.replace(start_scan_old, start_scan_new)

with open('tpqkita-php/scanner.php', 'w') as f:
    f.write(content)

