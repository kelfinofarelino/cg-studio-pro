import React, { useRef, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { getPointsDDA, getPointsBresenham } from '../engine/algorithms';
import { filterLineStyles } from '../engine/lineStyles';
import { checkHandleHit } from '../engine/transforms';
import { applyAlphaBlending } from '../engine/alphaBlending';
import { executeFloodFill } from '../engine/floodFill';
import { getScreenCoordinatesOfHandles, defineLayerPath } from '../engine/geometry';
import { createLine, createRect, createTriangle, createEllipse, createPen, createEraser } from '../tools/index';
import { handleSelection } from '../tools/SelectTool';
import { TOOLS } from '../utils/constants';

/**
 * FUNGSI UTILITAS: deepCloneLayers
 * Melakukan kloning mendalam (deep clone) terhadap array layer.
 * Sangat krusial untuk memutus referensi memori (memory reference pointer) agar 
 * data kanvas offscreen murni terduplikasi secara aman di sistem Undo/Redo History.
 */
const deepCloneLayers = (arr) => {
  return arr.map(layer => {
    const klon = { ...layer };
    if (layer.path) klon.path = layer.path.map(p => ({ ...p }));
    if (layer.filledPixels) klon.filledPixels = layer.filledPixels.map(p => ({ ...p }));
    if (layer.canvasRef) {
      const offscreen = document.createElement('canvas');
      offscreen.width = layer.canvasRef.width; 
      offscreen.height = layer.canvasRef.height;
      offscreen.getContext('2d').drawImage(layer.canvasRef, 0, 0);
      klon.canvasRef = offscreen;
    }
    return klon;
  });
};

export default function Canvas() {
  // Mengambil state global dan fungsi pengendali dari EditorContext
  const canvasRef = useRef(null);
  const { 
    currentTool, currentShape, globalColor, globalOpacity, strokeWidth, lineStyle, rasterAlgo,
    layers, setLayers, activeLayerIndex, setActiveLayerIndex, transformState, setTransformState,
    flatRasterData, setFlatRasterData, saveHistory
  } = useEditor();

  // --- REFS UNTUK MENGHINDARI STALE CLOSURE PADA EVENT TETIKUS BERFREKUENSI TINGGI ---
  const isDrawingRef = useRef(false);       // Menandai apakah pengguna sedang menekan & menggeser mouse
  const dragStartRef = useRef({ x: 0, y: 0 }); // Mencatat koordinat awal klik mouse
  const activeHandleRef = useRef(null);     // Menyimpan id kotak handle transform yang sedang diklik (cth: 'br', 'tl')
  const activeLayerIndexRef = useRef(activeLayerIndex);
  const layersRef = useRef(layers);

  // Sinkronisasi konstan dari State React ke Mutable Refs agar terbaca instan di event mousemove
  useEffect(() => { activeLayerIndexRef.current = activeLayerIndex; }, [activeLayerIndex]);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  // Efek pemicu render ulang otomatis setiap kali ada perubahan data objek atau alat aktif
  useEffect(() => {
    renderEngine();
  }, [layers, activeLayerIndex, flatRasterData, currentTool, transformState]);

  /**
   * FUNGSI UTAMA: renderEngine
   * Pipeline core rendering kanvas ThetaDraw.
   * Bertanggung jawab membersihkan layar, menggambar background bitmap, melintasi seluruh tumpukan
   * objek vektor/flattened untuk dirasterisasi ke piksel, serta mencetak kotak bounding box seleksi.
   */
  const renderEngine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 1. Clear Screen: Bersihkan kanvas dari sisa gambar render lawas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Loop & Render Objek: Gambar seluruh lapisan objek dari urutan terbawah ke teratas
    layers.forEach((layer) => {
      ctx.save(); // Amankan state transformasi kanvas global
      
      // Terapkan Matriks Transformasi 2D Objek Vektor (Translasi, Rotasi, Skala, Shear)
      ctx.translate(layer.x + layer.pivotX, layer.y + layer.pivotY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.transform(1, layer.shearY, layer.shearX, 1, 0, 0);
      ctx.translate(-layer.pivotX, -layer.pivotY);

      // Kasus A: Jika tipe layer adalah gambar bitmap hasil peleburan (FLATTENED)
      if (layer.type === 'FLATTENED' && layer.canvasRef) {
        ctx.drawImage(layer.canvasRef, 0, 0);
      }

      // Kasus B: Gambar warna isi (fill) internal geometri sebelum flatten
      if (layer.type !== 'PEN' && layer.type !== 'FLATTENED' && layer.fillColor) {
        ctx.fillStyle = layer.fillColor; 
        defineLayerPath(ctx, layer); 
        ctx.fill();
      }

      // Kasus C: Gambar tumpukan koordinat piksel isi (fill) kustom milik Pen Tool
      if (layer.type === 'PEN' && layer.filledPixels) {
        ctx.fillStyle = layer.fillColor || layer.color; 
        layer.filledPixels.forEach(p => ctx.fillRect(p.x, p.y, 1, 1));
      }

      // Atur warna outline garis tepi objek
      ctx.fillStyle = layer.color; 
      ctx.strokeStyle = layer.color; 
      ctx.lineWidth = layer.thickness;

      let pts = [];
      // Tentukan otak algoritma diskrit pembentuk koordinat piksel (Bresenham vs DDA)
      const algo = layer.algo === 'dda' ? getPointsDDA : getPointsBresenham;

      // Pemetaan Geometri Vektor ke Koordinat Piksel Diskrit
      if (layer.type === 'LINE') pts = algo(0, 0, layer.w, layer.h);
      else if (layer.type === 'RECT' || layer.type === 'SQUARE') {
        pts = [...algo(0, 0, layer.w, 0), ...algo(layer.w, 0, layer.w, layer.h), ...algo(layer.w, layer.h, 0, layer.h), ...algo(0, layer.h, 0, 0)];
      } else if (layer.type.startsWith('TRIANGLE')) {
        let w = layer.w, h = layer.h;
        if (layer.type === 'TRIANGLE_EQUILATERAL' || layer.type === 'TRIANGLE_ISOSCELES') pts = [...algo(w / 2, 0, w, h), ...algo(w, h, 0, h), ...algo(0, h, w / 2, 0)];
        else if (layer.type === 'TRIANGLE_RIGHT') pts = [...algo(0, 0, w, h), ...algo(w, h, 0, h), ...algo(0, h, 0, 0)];
        else pts = [...algo(w / 3, 0, w, h), ...algo(w, h, 0, h), ...algo(0, h, w / 3, 0)];
      } else if (layer.type === 'ELLIPSE' || layer.type === 'CIRCLE') {
        let steps = 180, rx = Math.abs(layer.w / 2), ry = Math.abs(layer.h / 2), cx = layer.w / 2, cy = layer.h / 2;
        for (let i = 0; i < steps; i++) {
          let t1 = (i / steps) * 2 * Math.PI, t2 = ((i + 1) / steps) * 2 * Math.PI;
          pts = pts.concat(algo(cx + rx * Math.cos(t1), cy + ry * Math.sin(t1), cx + rx * Math.cos(t2), cy + ry * Math.sin(t2)));
        }
      } else if (layer.type === 'PEN') {
        for (let i = 0; i < layer.path.length - 1; i++) pts = pts.concat(algo(layer.path[i].x, layer.path[i].y, layer.path[i + 1].x, layer.path[i + 1].y));
      }

      // Eksekusi Gambar ke Layar Fisik
      if (layer.type === 'ERASER') {
        applyAlphaBlending(ctx, 'destination-out'); // Mode blend potong piksel transparan
        ctx.beginPath(); 
        for (let i = 0; i < layer.path.length - 1; i++) ctx.lineTo(layer.path[i].x, layer.path[i].y); 
        ctx.stroke();
      } else if (layer.type !== 'FLATTENED') {
        // Saring barisan koordinat piksel dengan gaya goresan (Solid, Dashed, Dotted, Dash-Dotted)
        pts = filterLineStyles(pts, layer.style, layer.thickness); 
        // Cetak fisik piksel menggunakan kotak solid piksel murni
        pts.forEach(p => ctx.fillRect(p.x - layer.thickness / 2, p.y - layer.thickness / 2, layer.thickness, layer.thickness));
      }
      
      ctx.restore(); // Kembalikan koordinat normal kanvas
      applyAlphaBlending(ctx, 'source-over'); // Normal blend mode
    });

    // 3. Bounding Box Rendering: Tampilkan garis seleksi biru jika berada di tool CURSOR
    if (currentTool === 'CURSOR' && activeLayerIndex !== -1 && layers[activeLayerIndex]) {
      drawBoundingBox(ctx, layers[activeLayerIndex]);
    }
  };

  /**
   * FUNGSI: drawBoundingBox
   * Menggambarkan boks pembatas luar berwarna biru di sekeliling objek terpilih,
   * lengkap dengan 8 kotak mini di setiap ujung sumbu sebagai handle kendali transformasi.
   */
  const drawBoundingBox = (ctx, layer) => {
    ctx.save(); 
    ctx.translate(layer.x + layer.pivotX, layer.y + layer.pivotY); 
    ctx.rotate((layer.rotation * Math.PI) / 180); 
    ctx.scale(layer.scaleX, layer.scaleY); 
    ctx.transform(1, layer.shearY, layer.shearX, 1, 0, 0); 
    ctx.translate(-layer.pivotX, -layer.pivotY);
    
    // Gambar garis outline seleksi
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, layer.w, layer.h);
    
    // Ganti warna handle: Putih untuk mode SCALE, Oranye untuk mode ROTATE/SHEAR (Corel Style)
    ctx.fillStyle = transformState === 'scale' ? '#ffffff' : '#f59e0b';
    const hCoords = { tl: { x: 0, y: 0 }, tm: { x: layer.w / 2, y: 0 }, tr: { x: layer.w, y: 0 }, ml: { x: 0, y: layer.h / 2 }, mr: { x: layer.w, y: layer.h / 2 }, bl: { x: 0, y: layer.h }, bm: { x: layer.w / 2, y: layer.h }, br: { x: layer.w, y: layer.h } };
    Object.values(hCoords).forEach(h => { ctx.fillRect(h.x - 4, h.y - 4, 8, 8); ctx.strokeRect(h.x - 4, h.y - 4, 8, 8); });
    ctx.restore();
  };

  /**
   * EVENT HANDLER: onMouseDown
   * Mengeksekusi aksi instan sesaat setelah klik mouse ditekan di area kanvas.
   * Berfungsi mendeteksi klik handle, seleksi objek, inisialisasi pembuatan objek bentuk baru,
   * serta menjalankan deteksi cerdas pengisian warna ember cat (Vektor internal vs Raster flood-fill).
   */
  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect(); 
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    isDrawingRef.current = true; 
    dragStartRef.current = { x: mx, y: my };

    // Kerangka cetakan konfigurasi dasar pembuatan objek baru
    const config = { color: globalColor, opacity: globalOpacity, thickness: strokeWidth, style: lineStyle, algo: rasterAlgo, id: layersRef.current.length + 1, fillColor: null, filledPixels: null };

    // Cabang A: Logika penanganan pointer pemilih objek (CURSOR)
    if (currentTool === 'CURSOR') {
      if (activeLayerIndexRef.current !== -1) {
        const layer = layersRef.current[activeLayerIndexRef.current]; 
        const screenHandles = getScreenCoordinatesOfHandles(layer); 
        let hit = null;
        // Deteksi tabrakan koordinat mouse dengan 8 titik handle (Toleransi lingkaran radius 15px)
        Object.keys(screenHandles).forEach(k => { 
          const dx = mx - screenHandles[k].x; const dy = my - screenHandles[k].y; 
          if (Math.sqrt(dx * dx + dy * dy) <= 15) hit = k; 
        });
        if (hit) { activeHandleRef.current = hit; return; } // Kunci handle modifikasi aktif
      }
      // Jika tidak mengenai handle, lakukan hit-test pencarian objek di area koordinat klik
      const found = handleSelection(layersRef.current, mx, my);
      if (found === activeLayerIndexRef.current && found !== -1) {
        setTransformState(transformState === 'scale' ? 'rotate' : 'scale'); // Klik sekali lagi toggle state
      } else { setActiveLayerIndex(found); activeLayerIndexRef.current = found; }
    } 
    // Cabang B: Logika pembuatan objek baru geometri garis & bentuk boks dropdown
    else if (currentTool === 'LINE' || currentTool.includes('BOX')) {
      let newLayer;
      if (currentTool === TOOLS.LINE) newLayer = createLine(mx, my, config);
      if (currentTool === TOOLS.RECTBOX) newLayer = createRect(mx, my, config);
      if (currentTool === TOOLS.TRIANGLEBOX) newLayer = createTriangle(mx, my, config);
      if (currentTool === TOOLS.ELLIPSEBOX) newLayer = createEllipse(mx, my, config);
      newLayer.type = currentShape;
      activeLayerIndexRef.current = layersRef.current.length; setActiveLayerIndex(layersRef.current.length);
      setLayers([...layersRef.current, newLayer]);
    } 
    // Cabang C: Logika pembuatan objek coretan bebas Pen & Eraser
    else if (currentTool === TOOLS.PEN || currentTool === TOOLS.ERASER) {
      const func = currentTool === TOOLS.PEN ? createPen : createEraser; 
      const newLayer = func(mx, my, config);
      activeLayerIndexRef.current = layersRef.current.length; setActiveLayerIndex(layersRef.current.length);
      setLayers([...layersRef.current, newLayer]);
    } 
    // Cabang D: Logika sakti pengisian warna Ember Cat (FILL BUCKET)
    else if (currentTool === TOOLS.FILL) {
      const canvas = canvasRef.current; 
      let hitLayerIdx = -1; let isPenType = false; let isFlattenedType = false; let extractedPixels = null;

      // Pindai tumpukan objek dari atas ke bawah untuk menguji klik internal bentuk tunggal
      for (let i = layersRef.current.length - 1; i >= 0; i--) {
        const layer = layersRef.current[i]; 
        if (layer.type === 'LINE' || layer.type === 'ERASER') continue;

        if (layer.type !== 'PEN') {
          const ctx = canvas.getContext('2d'); ctx.save(); 
          ctx.translate(layer.x + layer.pivotX, layer.y + layer.pivotY); ctx.rotate((layer.rotation * Math.PI) / 180); ctx.scale(layer.scaleX, layer.scaleY); ctx.transform(1, layer.shearY, layer.shearX, 1, 0, 0); ctx.translate(-layer.pivotX, -layer.pivotY);
          if (layer.type === 'FLATTENED') { ctx.beginPath(); ctx.rect(0, 0, layer.w, layer.h); } else defineLayerPath(ctx, layer);
          
          const isInside = ctx.isPointInPath(mx, my); ctx.restore();
          if (isInside) { hitLayerIdx = i; if (layer.type === 'FLATTENED') isFlattenedType = true; break; }
        } else {
          // Logika isolasi koordinat penahanan lokal murni untuk Pen Tool
          const localCanvas = document.createElement('canvas'); localCanvas.width = 800; localCanvas.height = 550; const localCtx = localCanvas.getContext('2d');
          const tempC = document.createElement('canvas'); const tempCtx = tempC.getContext('2d');
          tempCtx.translate(layer.x + layer.pivotX, layer.y + layer.pivotY); tempCtx.rotate((layer.rotation * Math.PI) / 180); tempCtx.scale(layer.scaleX, layer.scaleY); tempCtx.transform(1, layer.shearY, layer.shearX, 1, 0, 0); tempCtx.translate(-layer.pivotX, -layer.pivotY);
          const imat = tempCtx.getTransform().invertSelf(); const lx = mx * imat.a + my * imat.c + imat.e; const ly = mx * imat.b + my * imat.d + imat.f;
          localCtx.strokeStyle = layer.color; localCtx.lineWidth = layer.thickness; localCtx.beginPath();
          if (layer.path && layer.path.length > 0) { localCtx.moveTo(layer.path[0].x, layer.path[0].y); for (let p of layer.path) localCtx.lineTo(p.x, p.y); }
          localCtx.stroke();

          const floodResult = executeFloodFill(localCanvas, Math.round(lx), Math.round(ly), globalColor);
          if (floodResult) {
            const data = floodResult.data; const rf = parseInt(globalColor.substr(1,2),16); const gf = parseInt(globalColor.substr(3,2),16); const bf = parseInt(globalColor.substr(5,2),16);
            if (!(data[0] === rf && data[1] === gf && data[2] === bf)) {
              hitLayerIdx = i; isPenType = true; const pixelCollector = [];
              for (let y = 0; y < 550; y++) { for (let x = 0; x < 800; x++) { const idx = (y * 800 + x) * 4; if (data[idx] === rf && data[idx+1] === gf && data[idx+2] === bf) pixelCollector.push({ x, y }); } }
              extractedPixels = pixelCollector; break;
            }
          }
        }
      }

      // Tembakkan warna isi sesuai hasil klasifikasi deteksi titik klik
      if (hitLayerIdx !== -1) {
        setLayers((prevLayers) => {
          const updated = deepCloneLayers(prevLayers);
          if (isFlattenedType) {
            // Pengisian warna piksel langsung ke kanvas internal objek "Flatten 1"
            const layer = updated[hitLayerIdx]; const tempC = document.createElement('canvas'); const tempCtx = tempC.getContext('2d');
            tempCtx.translate(layer.x + layer.pivotX, layer.y + layer.pivotY); tempCtx.rotate((layer.rotation * Math.PI) / 180); tempCtx.scale(layer.scaleX, layer.scaleY); tempCtx.transform(1, layer.shearY, layer.shearX, 1, 0, 0); tempCtx.translate(-layer.pivotX, -layer.pivotY);
            const imat = tempCtx.getTransform().invertSelf(); const lx = mx * imat.a + my * imat.c + imat.e; const ly = mx * imat.b + my * imat.d + imat.f;
            executeFloodFill(layer.canvasRef, Math.round(lx), Math.round(ly), globalColor);
          } else {
            if (isPenType) updated[hitLayerIdx].filledPixels = extractedPixels; 
            updated[hitLayerIdx].fillColor = globalColor;
          }
          return updated;
        });
        setTimeout(() => saveHistory(layersRef.current), 50);
      } else {
        // Klik jatuh di luar objek tunggal murni: Keluarkan instruksi warning penahan irisan kompleks
        alert("Untuk mewarnai ruang kosong hasil irisan dari tumpukan beberapa objek berbeda, silakan klik tombol 'Flatten App' terlebih dahulu!");
      }
    }
  };

  /**
   * EVENT HANDLER: onMouseMove
   * Mengatur seluruh jalannya perhitungan deformasi gambar ketika tetikus digeser beruntun.
   * Berfungsi mengubah kursor dinamis (move/resize/crosshair) saat hover, mengalkulasi pertambahan 
   * lebar/tinggi objek baru, penambahan koordinat path pen, serta manipulasi boks transformasi.
   */
  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect(); 
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    
    // SISTEM FEEDBACK KURSOR INDIKATOR INTERAKTIF CERDAS
    if (!isDrawingRef.current && currentTool === 'CURSOR' && activeLayerIndexRef.current !== -1) {
      const layer = layersRef.current[activeLayerIndexRef.current];
      if (layer) {
        const screenHandles = getScreenCoordinatesOfHandles(layer); let isHoveringHandle = false;
        Object.keys(screenHandles).forEach(k => { const dx = mx - screenHandles[k].x; const dy = my - screenHandles[k].y; if (Math.sqrt(dx * dx + dy * dy) <= 15) isHoveringHandle = true; });
        if (isHoveringHandle) canvasRef.current.style.cursor = transformState === 'scale' ? 'nwse-resize' : 'alias';
        else if (mx >= layer.x && mx <= layer.x + layer.w && my >= layer.y && my <= layer.y + layer.h) canvasRef.current.style.cursor = 'move';
        else canvasRef.current.style.cursor = 'crosshair';
      }
    } else if (!isDrawingRef.current) canvasRef.current.style.cursor = 'crosshair'; // Simbol "+" presisi grafika

    if (!isDrawingRef.current) return; // Gerbang penahan jika mouse tidak dalam kondisi ditekan drag
    const dx = mx - dragStartRef.current.x; const dy = my - dragStartRef.current.y;

    // Alur Kerja A: Eksekusi perubahan matriks modifikasi boks objek aktif
    if (currentTool === 'CURSOR') {
      setLayers((prevLayers) => {
        if (activeLayerIndexRef.current === -1 || !prevLayers[activeLayerIndexRef.current]) return prevLayers;
        const updated = deepCloneLayers(prevLayers); const layer = updated[activeLayerIndexRef.current];
        if (activeHandleRef.current) {
          const h = activeHandleRef.current;
          if (transformState === 'scale') {
            // Tarik regang asimetris/simetris berdasarkan 8 arah handle penarik sudut boks
            if (h === 'br') { layer.w += dx; layer.h += dy; }
            else if (h === 'tr') { layer.w += dx; layer.y += dy; layer.h -= dy; }
            else if (h === 'bl') { layer.x += dx; layer.w -= dx; layer.h += dy; }
            else if (h === 'tl') { layer.x += dx; layer.y += dy; layer.w -= dx; layer.h -= dy; }
            else if (h === 'mr') layer.w += dx; else if (h === 'ml') { layer.x += dx; layer.w -= dx; }
            else if (h === 'bm') layer.h += dy; else if (h === 'tm') { layer.y += dy; layer.h -= dy; }
          } else {
            // Manipulasi sudut putar (Rotation) dan tingkat kemiringan linear (Shear Skew)
            if (['tl', 'tr', 'bl', 'br'].includes(h)) layer.rotation += dx * 0.6;
            else if (['ml', 'mr'].includes(h)) layer.shearY += dy * 0.005;
            else if (['tm', 'bm'].includes(h)) layer.shearX += dx * 0.005;
          }
        } else { layer.x += dx; layer.y += dy; } // Seret menggeser potongan gambar mengambang
        return updated;
      });
      dragStartRef.current = { x: mx, y: my };
    } 
    // Alur Kerja B: Eksekusi peregangan ukuran pembuatan bentuk gambar baru
    else if ((currentTool === 'LINE' || currentTool.includes('BOX')) && activeLayerIndexRef.current !== -1) {
      setLayers((prevLayers) => {
        const updated = deepCloneLayers(prevLayers); const layer = updated[activeLayerIndexRef.current]; if (!layer) return prevLayers;
        
        if (layer.type === 'SQUARE' || layer.type === 'CIRCLE') { 
          let side = Math.max(Math.abs(mx - layer.x), Math.abs(my - layer.y)); 
          layer.w = mx - layer.x >= 0 ? side : -side; layer.h = my - layer.y >= 0 ? side : -side; 
        } 
        else if (layer.type === 'TRIANGLE_EQUILATERAL') {
          layer.w = mx - layer.x;
          // Pengunci Geometris Utama: Tinggi segitiga dipaksa mematuhi rasio trigonometri murni (0.866)
          const lockedH = Math.abs(layer.w) * (Math.sqrt(3) / 2);
          layer.h = (my - layer.y >= 0) ? lockedH : -lockedH;
        } 
        else { layer.w = mx - layer.x; layer.h = my - layer.y; }
        
        layer.pivotX = layer.w / 2; layer.pivotY = layer.h / 2; return updated;
      });
    } 
    // Alur Kerja C: Rekam jejak koordinat titik usapan kuas bebas Pen / Eraser tool
    else if ((currentTool === TOOLS.PEN || currentTool === TOOLS.ERASER) && activeLayerIndexRef.current !== -1) {
      setLayers((prevLayers) => {
        const updated = deepCloneLayers(prevLayers); updated[activeLayerIndexRef.current].path.push({ x: mx, y: my }); return updated;
      });
    }
  };

  /**
   * EVENT HANDLER: onMouseUp
   * Menutup alur interaksi menggambar sesaat setelah tekanan klik mouse dilepaskan.
   * Berfungsi membersihkan variabel kunci pemicu seret, serta memerintahkan sistem history 
   * untuk memotret kondisi kanvas teranyar agar tombol UNDO langsung aktif bersiaga.
   */
  const onMouseUp = () => { 
    if (isDrawingRef.current) { 
      isDrawingRef.current = false; 
      activeHandleRef.current = null; 
      saveHistory(layersRef.current); // Kunci kondisi kanvas ke memori snapshot langkah history
    } 
  };

  return (
    <div className="workspace">
      <div className="artboard-wrapper">
        <canvas ref={canvasRef} width={800} height={550} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
      </div>
    </div>
  );
}