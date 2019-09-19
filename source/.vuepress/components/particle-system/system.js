import Particle from './particle'
import Vector2 from './vector2'

/**
 * 标准正态分布
 */
function standardNormalDistribution() {
  const numberPool = []
  return function () {
    if (numberPool.length > 0) {
      return numberPool.pop()
    }
    else {
      const u = Math.random(), v = Math.random()
      const p = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
      const q = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v)
      numberPool.push(q)
      return p
    }
  }()
}

/**
 * 正态分布
 * @param {number} off 期望分布顶点离开数轴中心的偏移量
 * @param {number} con 相对标准正态分布的系数
 */
function NormalDistribution(off, con) {
  const standard = standardNormalDistribution()
  return standard * con + off
}

export default class ParticleSystem {
  static G = 6.67408

  constructor(ctx, w, h) {
    this.w = w || ctx.canvas.width / window.devicePixelRatio
    this.h = h || ctx.canvas.height / window.devicePixelRatio

    this.workers = []
    /** @type {Particle[]} */
    this.particles = []
    /** @type {CanvasRenderingContext2D} */
    this.context = ctx
    this.effectors = []

    this.pauseSignal = false
    this.disableDevour = false
    this.disableGravitation = false

    this.lastRenderTime = new Float64Array(512)
    this.renderInterval = 0
  }

  emit(particle) {
    this.particles.push(particle)
  }
  emitMess(count, centerMass) {
    const __width = this.w
    const __height = this.h

    const O = new Vector2(__width / 2, __height / 2)
    const R = Math.min(__height, __width) / 2 - 50

    const ct = new Particle(O, Vector2.zero, Color.red, centerMass, true)
    ct.visible = false
    this.emit(ct)

    for (let i = 0; i < count; i++) {
      const randomX = random(__width / 2 - R, __width / 2 + R)
      const randomY = random(__height / 2 - Math.pow(R * R - Math.pow(randomX - __width / 2, 2), 0.5), Math.pow(R * R - Math.pow(randomX - __width / 2, 2), 0.5) + __height / 2)
      const P = new Vector2(randomX, randomY)
      this.emit(new Particle(
        P,
        O.subtract(P).rotate(Math.PI / 2, Vector2.zero).normalize().multiply(NormalDistribution(400, 200)),
        Color.random(),
        random(10, 1000)
      ))
    }
  }

  remove(index) {
    if (!this.particles[index] || !this.particles[index].dead) {
      return
    }
    this.particles[index] = this.particles[this.particles.length - 1]
    this.particles.pop()
  }

  kinematics(dt) {
    for (const particle of this.particles) {
      if (particle.stasis) {
        particle.acceleration = particle.velocity = Vector2.zero
        continue
      }
      particle.position = particle.position.add(particle.velocity.multiply(dt))
      particle.velocity = particle.velocity.add(particle.acceleration.multiply(dt))
    }
  }

  devour() {
    this.particles.sort((a, b) => b.mass - a.mass).forEach((p, _tmp, particlesRef) => {

      const foodCandidateIndex = []

      particlesRef.filter((pOther, innerIndex) => {

        if (p.mass <= pOther.mass) return
        if (p === pOther) return

        const canEat = Particle.distancePow2(p, pOther) < Particle.RocheLimitPow2(p, pOther)

        if (canEat) {
          foodCandidateIndex.push(innerIndex)
        }

        return canEat
      }).forEach(foodP => p.devourOther(foodP))
      
      foodCandidateIndex.forEach(beEatenIndex => this.remove(beEatenIndex))
    })
    
    this.particles.forEach((p, index) => {
      if (p.dead) this.remove(index)
    })
  }

  universalGravitation() {
    this.particles.forEach((p) => {

      const totalGravitation = this.particles.reduce((pv, cv) => {
        if (p === cv) {
          return pv
        }
        else {
          const gravAcc = ParticleSystem.G * cv.mass / Particle.distancePow2(p, cv)
          const gravVec = Vector2.unit(cv.position.x - p.position.x, cv.position.y - p.position.y).multiply(gravAcc)
          return pv.add(gravVec)
        }
      }, Vector2.zero)

      p.acceleration = totalGravitation
    })
  }

  applyEffectors() {
    for (const effector of this.effectors) {
      const apply = effector.apply
      for (const p of this.particles) apply(p)
    }
  }

  simulate(dt) {
    if (this.pauseSignal) return

    this.applyEffectors()
    if (!this.disableDevour) this.devour()
    if (!this.disableGravitation) this.universalGravitation()
    this.kinematics(dt)
  }

  recordRenderTime() {
    const now = performance.now()
    const zeroIndex = this.lastRenderTime.findIndex(v => v === 0)
    const actualLength = zeroIndex === -1 ? this.lastRenderTime.length : zeroIndex + 1

    if (zeroIndex === -1) {
      this.lastRenderTime.set(this.lastRenderTime.subarray(1))
      this.lastRenderTime.set([now], this.lastRenderTime.length - 1)
    }
    else {
      this.lastRenderTime.set([now], zeroIndex)
    }

    if (actualLength < 100) {
      this.renderInterval = (now - this.lastRenderTime[0]) / actualLength
    }
    else {
      this.renderInterval = (now - this.lastRenderTime[actualLength - 100]) / 100
    }
  }

  render() {
    for (const p of this.particles) {
      if (p.outOfScreen() || !p.visible) continue
      p.render(this.context)
    }
  }

  complexRender() {
    for (const p of this.particles) {
      p.complexRender(this.context)
    }

    this.recordRenderTime()
  }
}
