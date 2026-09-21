import '@testing-library/jest-dom'

// ---- Canvas mock para jsdom ----
// jsdom SÍ define getContext, pero lanza "not implemented" al invocarlo
// (no soporta rendering 2D sin el paquete `canvas`), así que hay que
// sobrescribirlo siempre, no solo cuando falta.
HTMLCanvasElement.prototype.getContext = () => {
  const noop = () => {}
  return {
      canvas: {},
      fillRect: noop,
      clearRect: noop,
      beginPath: noop,
      moveTo: noop,
      lineTo: noop,
      stroke: noop,
      arc: noop,
      fill: noop,
      strokeRect: noop,
      closePath: noop,
      save: noop,
      restore: noop,
      setTransform: noop,
      translate: noop,
      scale: noop,
      rotate: noop,
      transform: noop,
      drawImage: noop,
      fillText: noop,
      measureText: () => ({ width: 0 }),
      putImageData: noop,
      createLinearGradient: () => ({ addColorStop: noop }),
      createPattern: () => ({}),
      createRadialGradient: () => ({ addColorStop: noop }),
      getImageData: () => ({}),
      getLineDash: () => [],
      setLineDash: noop,
  }
}
