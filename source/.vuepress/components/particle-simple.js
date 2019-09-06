function random(lower, upper) {
  return lower + (upper - lower) * Math.random()
}
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
function NormalDistribution(off, con) {
  const standard = standardNormalDistribution()
  return standard * con + off
}

export class ChamberBox {
  constructor(x1 = 0, y1 = 0, x2, y2, elasticCoefficient) {
    elasticCoefficient = elasticCoefficient || 1
    this.apply = particle => {
      if (particle.position.x - particle.radius < x1 || particle.position.x + particle.radius > x2) {
        particle.velocity.x = -1 * elasticCoefficient * particle.velocity.x
      }
      if (particle.position.y - particle.radius < y1 || particle.position.y + particle.radius > y2) {
        particle.velocity.y = -1 * elasticCoefficient * particle.velocity.y
      }
    }
  }
}

export class Color {
  static black = new Color(0, 0, 0)
  static white = new Color(1, 1, 1)
  static red = new Color(1, 0, 0)
  static green = new Color(0, 1, 0)
  static blue = new Color(0, 0, 1)
  static yellow = new Color(1, 1, 0)
  static cyan = new Color(0, 1, 1)
  static purple = new Color(1, 0, 1)
  static random() {
    return new Color(random(.15, .9), random(.1, .9), random(.2, .9))
  }
  constructor(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }
  toRgba(alpha) {
    return `rgba(${Math.floor(this.r * 255)},${Math.floor(this.g * 255)},${Math.floor(this.b * 255)},${alpha})`
  }
}

export class Vector2 {
  static zero = new Vector2(0, 0)
  static unit(x, y) {
    const u = new Vector2(x, y)
    const dvd = u.length()
    return u.divide(dvd)
  }
  constructor (x, y) {
    this.x = x
    this.y = y
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  normalize() {
    var inv = 1 / this.length()
    return new Vector2(this.x * inv, this.y * inv)
  }
  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y)
  }
  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y)
  }
  multiply(f) {
    return new Vector2(this.x * f, this.y * f)
  }
  divide(f) {
    var invf = 1 / f
    return new Vector2(this.x * invf, this.y * invf)
  }
  rotate(angle, center) {
    return new Vector2(
      (this.x - center.x) * Math.cos(angle) - (this.y - center.y) * Math.sin(angle) + center.x,
      (this.x - center.x) * Math.sin(angle) + (this.y - center.y) * Math.cos(angle) + center.y
    )
  }
}

export class Particle {
  static distancePow2(a, b) {
    return Math.pow(a.position.x - b.position.x, 2) + Math.pow(a.position.y - b.position.y, 2)
  }
  static massToRadius(mass) {
    return Math.pow(mass, 1 / 15)
  }
  static RocheLimitPow2(a, b) {
    return Math.pow(a.radius + b.radius, 2)
  }
  constructor(position, velocity, color, mass, stasis = false, obWidth = 960, obHeight = 960) {
    this.position = position
    this.velocity = velocity
    this.acceleration = Vector2.zero
    this.color = color
    this.mass = mass
    this.radius = Particle.massToRadius(mass)

    this.stasis = stasis
    this.visible = true

    this.dead = false
    this.isSelected = false

    this.obWidth = obWidth
    this.obHeight = obHeight
  }
  devourOther(pOther) {
    if (pOther.mass < this.mass && !this.dead && !pOther.dead) {
      // m1 * v1 + m2 * v2 = (m1 + m2) * v'
      const newVelovity = this.velocity.multiply(this.mass).add(pOther.velocity.multiply(pOther.mass)).divide(this.mass + pOther.mass)
      this.velocity = newVelovity
      this.mass += pOther.mass
      this.radius = Particle.massToRadius(this.mass)
      pOther.dead = true
    }
  }
  outOfScreen() {
    return this.position.x + this.radius < 0 || this.position - this.radius > this.obWidth ||
      this.y + this.radius < 0 || this.y - this.radius > this.obHeight
  }
}

export class ParticleSystem {
  static G = 6.67408e-3
  constructor(ctx, w, h) {
    this.w = w
    this.h = h
    this.workers = []
    this.particles = []
    this.context = ctx
    this.pauseSignal = false
    this.inner_p_count = 0
    this.pCount = 0
    this.effectors = []
  }

  get pCount() {
    return this.inner_p_count
  }
  set pCount(v) {
    this.inner_p_count = v
  }

  emit(particle) {
    this.particles.push(particle)
    ++this.pCount
  }
  emitMess(count) {
    const __width = this.w
    const __height = this.h

    const O = new Vector2(__width / 2, __height / 2)
    const R = Math.min(__height, __width) / 2 - 50

    const ct = new Particle(O, Vector2.zero, Color.red, 10 * count, true)
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
    if (!this.particles[index].dead) {
      return
    }
    this.particles.splice(index, 1)
    --this.pCount
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
    this.particles.sort((a, b) => b.mass - a.mass).forEach((p, selfIndex, particlesRef) => {

      const foodCandidateIndex = []

      particlesRef
        .filter((pOther, innerIndex) => {

          if (p.mass <= pOther.mass) return
          if (innerIndex === selfIndex) return

          const canEat = Particle.distancePow2(p, pOther) < Particle.RocheLimitPow2(p, pOther)

          if (canEat) {
            foodCandidateIndex.push(innerIndex)
          }

          return canEat
        })
        .forEach(foodP => p.devourOther(foodP))
      
      foodCandidateIndex.forEach(beEatenIndex => this.remove(beEatenIndex))
    })
    
    this.particles.forEach((p, index) => {
      if (p.dead) this.remove(index)
    })
  }

  universalGravitation() {
    this.particles.forEach((p, index) => {

      const totalGravitation = this.particles.reduce((pv, cv, innerIndex) => {
        if (innerIndex === index) {
          return pv
        }
        else {
          const gravAcc = ParticleSystem.G * (cv.mass * 1000) / Particle.distancePow2(p, cv)
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
    this.devour()
    this.universalGravitation()
    this.kinematics(dt)
  }

  render() {
    // this.context.clearRect(0, 0, this.w, this.h)

    for (const p of this.particles) {

      if (p.outOfScreen() || !p.visible) continue

      this.context.fillStyle = p.color.toRgba(1)
      this.context.beginPath()
      this.context.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2, true)
      this.context.closePath()
      this.context.fill()
    }
  }
}
