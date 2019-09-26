import Vector2 from './vector2'
import { Color } from './others'

export default class Particle {
  static distancePow2(a, b) {
    return Math.pow(a.position.x - b.position.x, 2) + Math.pow(a.position.y - b.position.y, 2)
  }
  static massToRadius(mass) {
    return Math.pow(mass, 1 / 12)
  }
  static RocheLimitPow2(a, b) {
    return Math.pow((a.radius + b.radius) * 1.0134, 2)
  }
  constructor(position, velocity, color, mass, stasis = false, obWidth = 960, obHeight = 960) {
    /** @type {Vector2} */
    this.position = position

    /** @type {Vector2} */
    this.lastPosition = null

    /** @type {Vector2} */
    this.velocity = velocity

    /** @type {Vector2} */
    this.acceleration = Vector2.zero

    /** @type {Color} */
    this.color = color

    /** @type {number} */
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
      this.color = this.color.add(pOther.color)
      pOther.dead = true
    }
  }
  outOfScreen() {
    return this.position.x + this.radius < 0 || this.position - this.radius > this.obWidth ||
      this.y + this.radius < 0 || this.y - this.radius > this.obHeight
  }

  render(ctx) {
    ctx.fillStyle = this.color.toRgba(1)

    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
  }

  complexRender(ctx) {

    for (let i = 1; i <= Math.ceil(this.radius * 2); i += 1) {
      ctx.beginPath()
      ctx.arc(this.position.x, this.position.y, i, 0, Math.PI * 2)
      ctx.closePath()
      ctx.strokeStyle = this.color.toRgba(Math.random())
      ctx.stroke()
    }
  }

  renderPath(ctx) {
    if (this.lastPosition) {
      ctx.save()
      ctx.lineWidth = 1
      ctx.strokeStyle = this.color.toRgba(.5)
      ctx.beginPath()
      ctx.moveTo(this.lastPosition.x, this.lastPosition.y)
      ctx.lineTo(this.position.x, this.position.y)
      ctx.stroke()
      ctx.restore()
    }
  }
}