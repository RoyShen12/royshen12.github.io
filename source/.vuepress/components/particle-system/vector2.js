export default class Vector2 {
  static zero = new Vector2(0, 0)
  static unit(x, y) {
    const u = new Vector2(x, y)
    const dvd = u.length()
    return u.divide(dvd)
  }
  static isNaV(vec) {
    return isNaN(vec.x) || isNaN(vec.y)
  }
  constructor (x, y) {
    this.x = x
    this.y = y
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  copy() {
    return new Vector2(this.x, this.y)
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