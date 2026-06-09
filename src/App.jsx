import React from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import LayerPanel from './components/LayerPanel';

function MainStudio() {
  const { layers, setLayers, setActiveLayerIndex, saveHistory } = useEditor();

  const handleFlatten = () => {
    if (layers.length === 0) return;
    const mainCanvas = document.querySelector('canvas');
    if (!mainCanvas) return;
    
    // 1. Ambil snapshot visual kanvas saat ini lalu salin ke memori offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = mainCanvas.width;
    offscreen.height = mainCanvas.height;
    offscreen.getContext('2d').drawImage(mainCanvas, 0, 0);

    // 2. Hitung jumlah total layer flatten untuk penamaan dinamis otomatis
    const flattenCount = layers.filter(l => l.name.startsWith('Flatten')).length + 1;
    
    // 3. Bangun struktur data objek layer Flatten baru
    const newFlattenedLayer = {
      type: 'FLATTENED',
      x: 0, y: 0,
      w: mainCanvas.width, h: mainCanvas.height,
      rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
      pivotX: mainCanvas.width / 2, pivotY: mainCanvas.height / 2,
      name: `Flatten ${flattenCount}`,
      canvasRef: offscreen, // Mengunci gambar murni di dalam layer objek
      color: '#000000', thickness: 1, style: 'solid', algo: 'bresenham'
    };

    // 4. Perbarui tumpukan stack layer (Alert sukses telah dihapus secara instan)
    const updatedLayers = [newFlattenedLayer];
    setLayers(updatedLayers);
    setActiveLayerIndex(0);
    saveHistory(updatedLayers, null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div className="main-container">
        <Toolbar />
        <Canvas />
        <div className="right-sidebar">
          <PropertyPanel />
          <LayerPanel onFlatten={handleFlatten} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <MainStudio />
    </EditorProvider>
  );
}