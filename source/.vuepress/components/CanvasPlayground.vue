<template>
  <div class="cv-wrapper">
    <div v-if="!noEdit" class="cs_row">
      <span class="title">PlayGround</span>
      <span v-if="desc" class="title">{{ desc }}</span>
    </div>

    <div v-if="desc2" class="cs_row" style="margin-top: .4rem;">
      <span class="title l2">{{ desc2 }}</span>
    </div>

    <div v-if="desc3" class="cs_row" style="margin-top: .4rem;">
      <span class="title l2">{{ desc3 }}</span>
    </div>

    <div v-if="showFps" class="cs_row" style="margin-top: .4rem;">
      <span class="title l2">FPS {{ Math.round(fps * 10) / 10 }}</span>
    </div>

    <div class="cs_row" ref="canvasParentEle">
      <canvas v-if="!noPreCanvas" ref="canvasEle"></canvas>
    </div>

    <div class="cs_row" style="margin: 1rem 0 .6rem 0;">
      <button @click="run">run</button>
      <button @click="stop">stop</button>
      <button v-if="!noClear" @click="clear">clear</button>
      <button v-if="customFx && customFxText" @click="customBtn">{{ FxText }}</button>
    </div>

    <div v-if="!noEdit" class="cs_row">
      <ClientOnly>
        <codemirror v-model="jsContent" :options="cmOptions"></codemirror>
      </ClientOnly>
    </div>

  </div>
</template>

<script>
import flatten from 'lodash/flatten'

import _Vector2 from './particle-system/vector2'
import _Particle from './particle-system/particle'
import _ParticleSystem from './particle-system/system'
import * as Effector from './particle-system/effector'
import * as Other from './particle-system/others'

function randomStr (bits) {
  let ret = ''
  for (let index = 0; index < bits; index++) {
    ret += ((Math.random() * 16 | 0) & 0xf).toString(16)
  }
  return ret
}

const { Color, random } = Other
const { ChamberBox, Field } = Effector

const Vector2 = _Vector2
const Particle = _Particle
const ParticleSystem = _ParticleSystem

let hdl = -1

const debug = {
  showRule: false
}

export default {
  name: 'CanvasPlayground',
  data() {
    return {
      jsContent: this.js
        .replace(/\\n/g, '\n')
        .replace(/\\\\r/g, '>'),

      envContent: this.env ?
        this.env
          .replace(/\\n/g, '\n')
          .replace(/\\\\r/g, '>') :
        '',

      ctx: null,

      cmOptions: {
        mode: 'javascript',
        theme: 'vscode-dark',
      },

      FxText: this.customFxText || '',

      fps: 0
    }
  },
  props: {
    js: {
      type: String,
      required: true
    },

    noEdit: { type: Boolean },
    noClear: { type: Boolean },
    noPreCanvas: { type: Boolean },

    env: { type: String },

    desc: { type: String },
    desc2: { type: String },
    desc3: { type: String },

    showFps: { type: Boolean },

    customFx: { type: Array },
    customFxText: { type: String },
  },
  computed: {
    fullJs() {
      return this.envContent + '\n' + this.jsContent
    }
  },
  mounted() {
    this.isMobile = (function(a) {
      return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
    })(window.navigator.userAgent || window.navigator.vendor || window.opera)

    if (!window.__debug_ctn) {
      Object.defineProperty(window, '__debug_ctn', {
        writable: false,
        configurable: true,
        enumerable: true,
        value: [this]
      })
    }
    else {
      window.__debug_ctn.push(this)
    }

    if (this.noPreCanvas) return

    const dpi = window.devicePixelRatio
    // const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    /** @type {{ canvasEle: HTMLCanvasElement }} */
    const { canvasEle } = this.$refs

    const [height, width] = this.isMobile ? [Math.round(innerWidth * .6), innerWidth - (innerWidth / 16 * 2.2)] : [300, 500]

    canvasEle.style.width = width + 'px'
    canvasEle.style.height = height + 'px'
    canvasEle.setAttribute('width', width * dpi)
    canvasEle.setAttribute('height', height * dpi)
    this.ctx = canvasEle.getContext('2d')
    if (dpi > 1) this.ctx.scale(dpi, dpi)

    // #debug rule
    if (debug.showRule) {
      const dv = 10
      this.ctx.save()
      this.ctx.font = '10px bettercode'
      this.ctx.strokeStyle = 'rgb(0,0,0)'
      this.ctx.fillStyle = 'rgb(0,0,0)'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      this.ctx.lineWidth = 1
      for (let i = 0; i <= Math.floor(width / dv) * dv; i += dv) {
        if (i > 0) {
          this.ctx.moveTo(i, 0)
          this.ctx.lineTo(i, 5)
          this.ctx.stroke()
        }
        if (i % (dv * 10) === 0) this.ctx.fillText(i, i, 5)
      }
      this.ctx.textAlign = 'left'
      this.ctx.textBaseline = 'middle'
      for (let i = 0; i <= Math.floor(height / dv) * dv; i += dv) {
        if (i > 0) {
          this.ctx.moveTo(0, i)
          this.ctx.lineTo(5, i)
          this.ctx.stroke()
        }
        if (i % (dv * 10) === 0) this.ctx.fillText(i, 5, i)
      }
      this.ctx.restore()
    }
  },
  methods: {
    run() {
      const thisVM = this

      cancelAnimationFrame(hdl)
      clearTimeout(hdl)

      try {
        const ctx = this.ctx
        const { canvasParentEle } = this.$refs
        const [__height, __width] = this.isMobile ? [Math.round(innerWidth * .6), innerWidth - (innerWidth / 16 * 2.2)] : [300, 500]
        const setter = {
          set fps(v) {
            thisVM.fps = v
          }
        }

        eval(this.fullJs)
      } catch (error) {
        console.error(error)
        this.ctx.save()
        this.ctx.fillStyle = '#f5222d'
        this.ctx.font = '13px sans-serif'
        const errs = error.stack.split('\n')
        const mw = this.ctx.canvas.width - 40
        const last = q => q[q.length - 1]
        flatten(errs.map(s => {
          const ret = [s]
          let w = this.ctx.measureText(last(ret)).width
          while(w > mw) {
            const r = Math.round(mw / w * 10) / 10
            const pl = Math.round(last(ret).length * r)
            const last_temp = last(ret).slice(pl + 1)
            ret[ret.length - 1] = last(ret).slice(0, pl)
            ret.push(last_temp)
            w = this.ctx.measureText(last(ret)).width
          }
          return ret
        })).forEach((s, i) => {
          this.ctx.fillText(s, 20, 20 + i * 16)
        })
        this.ctx.restore()
      }
    },
    stop() {
      cancelAnimationFrame(hdl)
      clearTimeout(hdl)
    },
    clear() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      }
    },
    customBtn() {
      const fn = new Function(...this.customFx)
      fn.call(this)
    }
  }
}
</script>

<style scoped lang="scss">
canvas {
  z-index: 2;
  border: 1px solid #dcdfe6;
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  &:hover {
    border-color: #c0c4cc;
  }
}
button {
  padding: .5rem .9rem;
  border: none;
  background-color: #bfbfbf;
  &:hover {
    background-color: #e8e8e8;
  }
  &:active, &:focus {
    outline: none;
  }
  &:not(:last-child) {
    margin-right: .6rem;
  }
  transition: background-color .2s cubic-bezier(.645, .045, .355, 1);
}
.cv-wrapper {
  margin-top: 1rem;
  display: flexbox;
  align-items:center;
  justify-content:center;
}
.cs_row {
  position: relative;
  box-sizing: border-box;
  &::before {
    content: "";
    display: table;
  }
  &::after {
    content: "";
    clear: both;
    display: table;
  }
}
.title {
  font-size: .88rem;
  font-weight: 700;
  color: #8c8c8c;
}
.l2 {
  font-size: .75rem;
}
</style>
