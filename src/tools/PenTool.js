export function createPen(startX, startY, config) {
  return {
    type: 'PEN', x: 0, y: 0, w: 800, h: 550,
    rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0, pivotX: 0, pivotY: 0,
    path: [{ x: startX, y: startY }], ...config, name: `Pen Stroke ${config.id}`
  };
}