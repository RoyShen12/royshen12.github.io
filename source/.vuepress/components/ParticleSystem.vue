<template>
  <div id="ps-wrapper">
    <canvas ref="canvasElem" style="z-index:2;border: none;"></canvas>
  </div>
</template>

<script>
import {
  random,

  Color,
  Vector2,
  Particle,
  ParticleSystem,

  ChamberBox,
  Gravity,
  LoopWorld
} from './particle-simple'

// import throttle from 'lodash/throttle'
import range from 'lodash/range'

export default {
  name: 'ParticleSystem',
  beforeMount() {},
  mounted() {
    this.isMobile = (function(a) {
      return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
    })(window.navigator.userAgent || window.navigator.vendor || window.opera)

    const hasAdvancedCanvas =
      'ImageBitmapRenderingContext' in window && 'OffscreenCanvas' in window && 'OffscreenCanvasRenderingContext2D' in window

    console.log(`isMobile: ${this.isMobile}, canvas mode: ${hasAdvancedCanvas ? 'advance' : 'traditional'}`)
    const dpi = window.devicePixelRatio

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    /** @type {{ canvasElem: HTMLCanvasElement }} */
    const { canvasElem } = this.$refs

    const [height, width] = [500, this.isMobile ? innerWidth : 960]

    canvasElem.style.width = width + 'px'
    canvasElem.style.height = height + 'px'
    canvasElem.width = width * dpi
    canvasElem.height = height * dpi

    const dcStatusMachine = {
      idx: 0,
      directions: range(0, Math.PI * 2, Math.PI * 2 / 30),
      next() {
        if (this.directions[this.idx] === undefined) this.idx = 0
        return this.directions[this.idx++]
      }
    }

    canvasElem.onclick = e => {
      PS.switchRenderStyle()
    }

    canvasElem.onmousemove = e => {
      const { offsetX, offsetY } = e
      // 0无按键被按下 1主按键被按下 2次按键被按下 4辅助按键被按下
      // if (e.buttons === 1) {
      //   PS.emit(
      //     new Particle(
      //       new Vector2(offsetX, offsetY),
      //       new Vector2(1, 0).rotate(dcStatusMachine.next(), Vector2.zero).normalize().multiply(random(1000, 2000)),
      //       Color.random(),
      //       random(10, 100)
      //     )
      //   )
      // }
      // else {
        PS.emit(
          new Particle(
            new Vector2(offsetX, offsetY),
            new Vector2(random(-10, 10), random(-200, -100)),
            Color.random(),
            random(10, 100)
          )
        )
      // }
    }

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
    window.__ps = PS
    const simSpeed = 0.001

    PS.emitMess(isSafari ? 300 : 600, 1e3)
    PS.effectors.push(new ChamberBox(0, 0, width, height))
    // PS.effectors.push(new LoopWorld(0, 0, width, height))

    const loop = () => {
      PS.simulate(simSpeed)
      PS.render()

      if (hasAdvancedCanvas) {
        CTX.transferFromImageBitmap(OFC.transferToImageBitmap())
      }
      else {
        CTX.clearRect(0, 0, width * dpi, height * dpi)
        CTX.drawImage(OFC, 0, 0)
        CTX_OF.clearRect(0, 0, width, height)
      }
      requestAnimationFrame(loop)
    }

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