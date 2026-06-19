import React, { createContext, useContext, useState } from "react";
import { TOOLS, SHAPES } from "../utils/constants";

const EditorContext = createContext();

/**
 * Ini adalah "Otak Utama" aplikasi yang menggunakan React Context API.
 * Menyimpan status (state) global seperti: alat apa yang sedang aktif (tool), daftar tumpukan objek/layer, warna yang dipilih,
 * tingkat ketebalan garis, serta menyimpan memori history untuk fungsi Undo dan Redo. Semua komponen UI mengambil datanya dari
 * file ini.
 */

// --- ENGINE CLONING KANVAS MURNI UNTUK SISTEM UNDO/REDO ---
const deepCloneLayers = (arr) => {
  return arr.map((layer) => {
    const klon = { ...layer };
    if (layer.path) klon.path = layer.path.map((p) => ({ ...p }));
    if (layer.filledPixels)
      klon.filledPixels = layer.filledPixels.map((p) => ({ ...p }));
    if (layer.canvasRef) {
      const offscreen = document.createElement("canvas");
      offscreen.width = layer.canvasRef.width;
      offscreen.height = layer.canvasRef.height;
      offscreen.getContext("2d").drawImage(layer.canvasRef, 0, 0);
      klon.canvasRef = offscreen;
    }
    return klon;
  });
};

export function EditorProvider({ children }) {
  const [currentTool, setCurrentTool] = useState(TOOLS.CURSOR);
  const [currentShape, setCurrentShape] = useState(SHAPES.LINE);
  const [globalColor, setGlobalColor] = useState("#3b82f6");
  const [lineStyle, setLineStyle] = useState("solid");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [rasterAlgo, setRasterAlgo] = useState("bresenham");
  const [transformState, setTransformState] = useState("scale");

  const [layers, setLayers] = useState([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(-1);
  const [flatRasterData, setFlatRasterData] = useState(null);

  const [history, setHistory] = useState([{ layers: [], raster: null }]);
  const [historyPointer, setHistoryPointer] = useState(0);

  const saveHistory = (updatedLayers, updatedRaster) => {
    const nextLayers = updatedLayers !== undefined ? updatedLayers : layers;
    const nextRaster =
      updatedRaster !== undefined ? updatedRaster : flatRasterData;

    let cloneStack = history.slice(0, historyPointer + 1);
    cloneStack.push({
      layers: deepCloneLayers(nextLayers),
      raster: nextRaster
        ? new ImageData(
            new Uint8ClampedArray(nextRaster.data),
            nextRaster.width,
            nextRaster.height,
          )
        : null,
    });
    if (cloneStack.length > 30) cloneStack.shift();

    setHistory(cloneStack);
    setHistoryPointer(cloneStack.length - 1);
  };

  const undo = () => {
    if (historyPointer > 0) {
      const prev = history[historyPointer - 1];
      setLayers(deepCloneLayers(prev.layers));
      setFlatRasterData(prev.raster);
      setActiveLayerIndex(prev.layers.length - 1);
      setHistoryPointer(historyPointer - 1);
    }
  };

  const redo = () => {
    if (historyPointer < history.length - 1) {
      const next = history[historyPointer + 1];
      setLayers(deepCloneLayers(next.layers));
      setFlatRasterData(next.raster);
      setActiveLayerIndex(next.layers.length - 1);
      setHistoryPointer(historyPointer + 1);
    }
  };

  const deleteSelectedLayer = () => {
    if (activeLayerIndex === -1) return;
    const updated = layers.filter((_, i) => i !== activeLayerIndex);
    setLayers(updated);
    setActiveLayerIndex(-1);
    saveHistory(updated);
  };

  return (
    <EditorContext.Provider
      value={{
        currentTool,
        setCurrentTool,
        currentShape,
        setCurrentShape,
        globalColor,
        setGlobalColor,
        lineStyle,
        setLineStyle,
        strokeWidth,
        setStrokeWidth,
        rasterAlgo,
        setRasterAlgo,
        transformState,
        setTransformState,
        layers,
        setLayers,
        activeLayerIndex,
        setActiveLayerIndex,
        flatRasterData,
        setFlatRasterData,
        saveHistory,
        undo,
        redo,
        deleteSelectedLayer,
        canUndo: historyPointer > 0,
        canRedo: historyPointer < history.length - 1,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext);
