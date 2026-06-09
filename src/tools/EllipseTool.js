export function createEllipse(startX, startY, config) {
  return {
    type: 'ELLIPSE', x: startX, y: startY, w: 0, h: 0,
    rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0, pivotX: 0, pivotY: 0,
    ...config, name: `Ellipse Layer ${config.id}`
  };
}