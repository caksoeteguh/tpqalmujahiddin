import sys

with open('src/components/BarcodeScanner.tsx', 'r') as f:
    content = f.read()

# Add autoStartCamera prop
search_interface = """interface BarcodeScannerProps {
  santriList: Santri[];"""
replace_interface = """interface BarcodeScannerProps {
  autoStartCamera?: boolean;
  santriList: Santri[];"""
content = content.replace(search_interface, replace_interface)

search_props = """export default function BarcodeScanner({
  santriList,"""
replace_props = """export default function BarcodeScanner({
  autoStartCamera = false,
  santriList,"""
content = content.replace(search_props, replace_props)

search_camera_state = """const [isCameraActive, setIsCameraActive] = useState(false);"""
replace_camera_state = """const [isCameraActive, setIsCameraActive] = useState(autoStartCamera);"""
content = content.replace(search_camera_state, replace_camera_state)

with open('src/components/BarcodeScanner.tsx', 'w') as f:
    f.write(content)

print("BarcodeScanner patched successfully")
