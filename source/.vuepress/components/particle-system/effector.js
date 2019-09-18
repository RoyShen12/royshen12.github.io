import Vector2 from './vector2'

export class ChamberBox {
  constructor(x1, y1, x2, y2, elasticCoefficient) {
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

export class Field {
  /**
   * @param {number} dt
   * @param {(pos: Vector2) => Vector2} fieldAcc
   */
  constructor(dt, fieldAcc) {
    fieldAcc = fieldAcc || (() => new Vector2(0, 9.8))
    this.apply = particle => {
      particle.velocity = particle.velocity.add(fieldAcc(particle.position).multiply(dt))
    }
  }
}
