<template>
  <div id="ps-wrapper">
    <canvas ref="canvasElem" style="z-index:2;border: none;"></canvas>
  </div>
</template>

<script>
import {
  Color,
  Vector2,
  Particle,
  ParticleSystem,
  ChamberBox
} from './particle-simple'

export default {
  name: 'ParticleSystem',
  beforeMount() {},
  mounted() {
    const hasAdvancedCanvas = 'ImageBitmapRenderingContext' in window && 'OffscreenCanvas' in window
    const dpi = window.devicePixelRatio

    const { canvasElem } = this.$refs

    const [height, width] = [500, 960]

    canvasElem.style.width = width + 'px'
    canvasElem.style.height = height + 'px'
    canvasElem.width = width * dpi
    canvasElem.height = height * dpi

    const CTX = hasAdvancedCanvas ? canvasElem.getContext('bitmaprenderer') : canvasElem.getContext('2d')

    let OFC = null
    if (hasAdvancedCanvas) {
      OFC = new OffscreenCanvas(width * dpi, height * dpi)
    }
    else {
      OFC = document.createElement('canvas')
      OFC.width = width * dpi
      OFC.height = height * dpi
    }
    const CTX_OF = OFC.getContext('2d')
    if (dpi !== 1) CTX_OF.scale(dpi, dpi)

    const PS = new ParticleSystem(CTX_OF, width, height)

    PS.emitMess(600)
    PS.effectors.push(new ChamberBox(0, 0, width, height))

    const loop = () => {
      PS.simulate(0.001)
      PS.render()

      if (hasAdvancedCanvas) {
        CTX.transferFromImageBitmap(OFC.transferToImageBitmap())
      }
      else {
        CTX.clearRect(0, 0, CTX_OF.width, CTX_OF.height)
        CTX.drawImage(osc, 0, 0)
      }
      requestAnimationFrame(loop)
    }

    window.ps = PS

    loop()
  }
}
</script>

<style scoped>
#ps-wrapper {
  display: flex;
  align-items:center;
  justify-content:center;
}
</style>