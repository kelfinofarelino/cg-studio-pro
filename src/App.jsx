import React, { useState } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import LayerPanel from './components/LayerPanel';
import LandingPage from './components/LandingPage';

function MainStudio() {
  const { layers, setLayers, setActiveLayerIndex, saveHistory } = useEditor();

  const handleFlatten = () => {
    if (layers.length === 0) return;
    const mainCanvas = document.querySelector('canvas');
    if (!mainCanvas) return;
    
    const offscreen = document.createElement('canvas');
    offscreen.width = mainCanvas.width;
    offscreen.height = mainCanvas.height;
    offscreen.getContext('2d').drawImage(mainCanvas, 0, 0);

    const flattenCount = layers.filter(l => l.name.startsWith('Flatten')).length + 1;
    
    const newFlattenedLayer = {
      type: 'FLATTENED',
      x: 0, y: 0,
      w: mainCanvas.width, h: mainCanvas.height,
      rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
      pivotX: mainCanvas.width / 2, pivotY: mainCanvas.height / 2,
      name: `Flatten ${flattenCount}`,
      canvasRef: offscreen,
      color: '#000000', thickness: 1, style: 'solid', algo: 'bresenham'
    };

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
  const [hasStarted, setHasStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // State baru untuk trigger animasi keluar

  // Fungsi interseptor tombol mulai dengan efek delay transisi
  const handleStartTransition = () => {
    setIsExiting(true); // 1. Jalankan efek animasi fade out + blur di CSS
    setTimeout(() => {
      setHasStarted(true); // 2. Setelah 600ms (animasi selesai), ganti ke halaman studio
    }, 600);
  };

  return (
    <EditorProvider>
      <div style={{ backgroundColor: '#1a1c26', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {!hasStarted ? (
          // Wrapper untuk membungkus LandingPage dengan transisi dinamis
          <div style={{
            opacity: isExiting ? 0 : 1,
            filter: isExiting ? 'blur(20px)' : 'blur(0px)',
            transform: isExiting ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            height: '100%'
          }}>
            <LandingPage onStart={handleStartTransition} />
          </div>
        ) : (
          // Wrapper saat MainStudio masuk, memicu keyframe CSS fade-in pro
          <div className="animate-studio-enter" style={{ width: '100%', height: '100%' }}>
            <MainStudio />
          </div>
        )}
      </div>
    </EditorProvider>
  );
}