export function random(lower, upper) {
  return lower + (upper - lower) * Math.random()
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
    if (r > 1 || g > 1 || b > 1) {
      r = r / 255
      g = g / 255
      b = b / 255
    }
    this.r = r
    this.g = g
    this.b = b
  }
  add(c) {
    return new Color(Math.min((this.r + c.r) / 2, 1), Math.min((this.g + c.g) / 2, 1), Math.min((this.b + c.b) / 2, 1))
  }
  toRgba(alpha) {
    return `rgba(${Math.floor(this.r * 255)},${Math.floor(this.g * 255)},${Math.floor(this.b * 255)},${alpha})`
  }
  toReversedRgba(alpha) {
    return `rgba(${Math.floor((1 - this.r) * 255)},${Math.floor((1 - this.g) * 255)},${Math.floor((1 - this.b) * 255)},${alpha})`
  }
}