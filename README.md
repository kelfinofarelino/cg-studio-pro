# 🎨 ThetaDraw

> **Professional Web-Based Studio with Advanced Hybrid Vector-Raster Rendering Engine.**

ThetaDraw adalah aplikasi grafika komputer berbasis web modern yang menggabungkan fleksibilitas manipulasi objek **Vektor** dengan kekuatan manipulasi piksel **Raster (Bitmap)**. Proyek ini dibangun menggunakan arsitektur modular yang memisahkan logika interaksi, rendering, dan perhitungan matematika geometri murni.

---

## 🚀 Fitur Unggulan

### 1. Hybrid Rendering Pipeline (Core Engine)
* **Vector-Internal Filling:** Mewarnai bagian dalam objek tunggal (Rect, Circle, Triangle, Pen) sebelum dilebur (*Flatten*). Warna isi diikat ke properti objek sehingga **otomatis ikut berputar, melebar, mengecil, dan bergeser** saat ditransformasikan.
* **Smart Flattening System:** Melebur seluruh objek vektor menjadi satu layer bitmap independen bernama **"Flatten 1"** secara instan tanpa pop-up yang mengganggu. Layer ini tetap bisa dihapus (*Delete Object*) atau dimanipulasi lebih lanjut.
* **Optimized Flood Fill:** Algoritma *Ember Cat* pada objek raster menggunakan metode **Queue-Pointer BFS dengan Immediate Pixel Coloring** berkecepatan tinggi (< 10ms) yang menjamin performa anti-freeze pada kanvas beresolusi besar ($800 \times 550$).

### 2. Dual Rasterization Algorithm
Anda dapat bereksperimen mengubah "otak matematis" komputer dalam memetakan garis vektor ke dalam grid piksel diskrit melalui dua pilihan algoritma legendaris:
* **Bresenham's Line Engine:** Menggunakan matematika bilangan bulat murni murni (*pure integer math*) untuk performa rendering super cepat standar kartu grafis modern.
* **DDA (Digital Differential Analyzer):** Menggunakan pendekatan kalkulus berbasis kemiringan desimal (*floating-point*) dengan pembulatan nilai koordinat.

### 3. Studio Pro Layout & Advanced Controls
* **Photoshop-Style Color Picker:** Komponen warna kustom berbasis ruang warna HSV (Hue, Saturation, Value) dua sumbu, slider pelangi vertikal, input kode warna berbasis teks **HEX**, serta deretan palet warna instan di bagian bawah.
* **Locked Geometry Constraints:** Sistem penarik mouse cerdas yang otomatis mengunci rasio simetris murni untuk bentuk *Square*, *Circle*, dan *Equilateral Triangle* (mengunci tinggi berdasarkan rumus kalkulasi $H = |W| \times \frac{\sqrt{3}}{2}$).
* **Flexible Transformations UI:** Kendali penuh atas 8 titik *handle box* untuk melakukan *scaling*, rotasi sudut kemiringan (*rotation*), serta pergeseran sudut dimensi miring (*shear/skew*).
* **Advanced Line Styles:** Dropdown pratinjau instan untuk mengubah model garis tepi menjadi *Solid*, *Dashed*, *Dotted*, atau *Dash-Dotted*.

---

## 🛠️ Tech Stack

* **Framework:** React.js (Functional Components & Hooks)
* **State Management:** React Context API (`EditorContext`)
* **Icons:** Lucide React
* **Styling:** Custom CSS (Photoshop Dark Theme Spectrum)
* **Core Canvas:** HTML5 Canvas API via `useRef`

---

## 📂 Struktur Folder Proyek

```text
thetadraw/
├── public/
├── src/
│   ├── components/       # Komponen UI (TopBar, Toolbar, PropertyPanel, LayerPanel)
│   │   ├── Canvas.jsx    # Master Render Engine & Mouse Event Handlers
│   │   ├── ColorPicker.jsx # Kustom HSV & HEX Color Picker Component
│   │   └── ...
│   ├── context/          # EditorContext (Global State & Undo-Redo History)
│   ├── engine/           # Otak Matematis Komputer Grafis
│   │   ├── algorithms.js # Implementasi Engine Bresenham & DDA
│   │   ├── geometry.js   # Perhitungan Matriks Transformasi 2D & Hit-Path
│   │   ├── floodFill.js  # Optimasi Antrean BFS Fast Flood Fill
│   │   └── lineStyles.js # Filter Penyaring Tekstur Garis
│   ├── utils/            # Konstanta & Preset Warna Global
│   ├── App.jsx           # Root Layout Studio
│   └── index.css         # CSS Layout Tumpukan Dok (Docked Panel CSS)
├── index.html            # Aplikasi HTML Entry Point
├── package.json          # Node.js Dependencies
└── .gitignore            # Pengaman Filter Repositori Git
```

---

## ⚙️ Cara Menjalankan Proyek Secara Lokal
1. Kloning Repositori
```text
git clone [https://github.com/kelfinofarelino/cg-studio-pro](https://github.com/kelfinofarelino/cg-studio-pro)
```
```text
cd ThetaDraw
```

2. Install Dependencies
```text
npm install
```
3. Jalankan Server Development (Vite)
```text
npm run dev
```
Buka alamat tautan http://localhost:5173 di browser Anda untuk mulai menggambar!

---

## 📝 Kontribusi & Lisensi
Proyek ini dibangun sebagai bagian dari eksplorasi mendalam di bidang Grafika Komputer. Seluruh kode dirancang dengan prinsip clean code dan modular agar mudah dipelajari kembali.

Distributed under the MIT License. See LICENSE for more information.