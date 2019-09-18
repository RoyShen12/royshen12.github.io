---
title: 用 JavaScript 实现粒子系统和万有引力
tags: [Canvas]
categories:
  - Web
date: 2019-09-05 09:47:00
sidebar: auto
---

## 本文目标

本文将介绍简单的运动学模拟，以及如何使用 Canvas 实现一个符合直觉的，遵循现实世界物理规则的粒子系统。  

本文将假设读者了解：
1. 基本的 Canvas fill, stroke, arc 等绘图函数
2. ES6 语法

##  理论基础

设物体在任意时间 t 具有状态：位置 $r(t)$，速度 $v(t)$，加速度 $a(t)$，质量 $m$，合外力 $F(t)$。  

在计算机系统中，一切都是离散的，因此我们无法真正地模拟连续的真实世界，为此我们取一个足够小的 $\delta t$，每次我们都从物体当前的 $t$ 时刻状态，计算物体下一个时刻 $\delta t$ 的状态，也即：  

$$v(t + \delta t) = v(t) + a(t)\delta t = v(t) + \frac{F(t)}{m} \delta t$$

$$r(t + \delta t) = r(t) + v(t)\delta t$$

::: tip
这里采用了欧拉法，存在准确度和稳定性问题，在此我们先忽略这些问题。
:::

容易得出，计算机模拟的物体运动即是求解每个时刻物体的新位置和新速度，新速度依赖于所受外力或直接更简单的模型下的直接加速度，新位置则依赖于新速度。  

接下来我们将实际编码，开始实现系统。

## 二维空间中的向量 <Badge text="Vector2" />

我们创建一个 Vector2 类，来表示一个二维空间中的向量，它具有两个指标 $x$ 和 $y$。
::: tip
在典型的浏览器中的 Canvas 画布中，$x$ 表示横坐标、$y$ 表示纵坐标，并且画布的左上角是 $<0, 0>$，向右 $x$ 递增，向下 $y$ 递增。
:::
``` js
class Vector2 {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
  // 二维向量的模
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
}
```
为向量添加基础的运算方法
``` js
// 取单位向量
normalize() {
  const inv = 1 / this.length()
  return new Vector2(this.x * inv, this.y * inv)
}
// 向量加, v 是另一个 Vector2
add(v) {
  return new Vector2(this.x + v.x, this.y + v.y)
}
// 向量减, v 是另一个 Vector2
subtract(v) {
  return new Vector2(this.x - v.x, this.y - v.y)
}
// 向量数/叉乘, f 是一个数
multiply(f) {
  return new Vector2(this.x * f, this.y * f)
}
// 向量数除, f 是一个数
divide(f) {
  const invf = 1 / f
  return new Vector2(this.x * invf, this.y * invf)
}
// 向量间点乘, v 是另一个 Vector2
dot(v) {
  return this.x * v.x + this.y * v.y
}
```
::: warning
注意，所有的运算方法都是不可变的（**Immutable**），也就是说执行方法后自身[和参与运算的其他向量]不会发生改变。
:::

为其添加**静态**属性和方法
``` js
Vector2.zero = new Vector2(0, 0) // zero 是坐标原点，也是一个零向量
Vector2.unit = function (x, y) {
  const u = new Vector2(x, y)
  return u.normalize()
}
```

## 粒子的抽象 <Badge text="Particle" />

粒子的位置，速度，加速度都能抽象成一个 Vector2。

有了二维向量，就可以着手构建粒子，在运动模拟中，我们将忽略一个粒子的大多数特征，如惯量、力矩、自旋，由此可以得到这个简略的粒子类：
``` js
class Particle {
  constructor(position, velocity, color, mass) {
    this.position = position
    this.velocity = velocity
    this.acceleration = Vector2.zero
    this.color = color
    this.mass = mass
    this.radius = Particle.massToRadius(mass)

    this.dead = false
  }
}
```
可以看到，粒子由**位置**，**速度**，**颜色**和**质量**这四个基本要素构成。  
位置和速度都是 Vector2 类型，颜色的类型是帮助类 [Color](#source-code-color)（见附录）。  

Particle 的半径由它的质量通过如下方式计算而出：
$$R = \sqrt[12]{m}$$
此处我们假设了所有的粒子具有相同的密度以简化计算，并且减少了质量差距带来的半径差距————为了渲染美观。
``` js
Particle.massToRadius = function (mass) {
  return Math.pow(mass, 1 / 12)
}
```
Particle 还有其他**静态**方法：
``` js
Particle.distancePow2 = function (a, b) { // 计算两个粒子的欧几里得距离的平方
  return Math.pow(a.position.x - b.position.x, 2) + Math.pow(a.position.y - b.position.y, 2)
}
```

到目前为止，我们已经有了 Vector2 和 Particle 两个类，现在我们已经可以尝试实现一些基础的运动过程。

## 单个粒子的运动

因为加速度可以由合外力和质量简单计算得出，我们考虑最简单的加速度速度模型：单个粒子不受外力的情况。  

设我们拥有粒子 `p = new Particle(vec1, vec2, color, mass)` ，时间间隔量 `dt`，具有加速度 `acceleration`  

根据上文的公式，我们可以得出两条具体的表达式：
``` js
p.position = p.position.add( p.velocity.multiply(dt) )
p.velocity = p.velocity.add( acceleration.multiply(dt) )
```
::: tip
实际运算时，习惯上先计算当前的位置，再更新当前的速度。
:::

在每个计算周期，这两条表达式都会运行，更新 `p` 的位置和速度矢量。  

## 准备 Canvas

有了上面这两条核心的运动逻辑，现在我们只差让粒子动起来的 **画布** 了。  

我们所说的画布是一个 **CanvasRenderingContext2D** 类型的对象，通常我们用 `ctx` 来命名它  
画布依赖于它所属的支撑的元素：**HTMLCanvasElement** 类型的对象，通常被命名为 `canvas` 或 `canvasEle`，前者通过后者原型上的方法`getContext`得到（参数必须是`'2d'`）。  

::: tip
在大多数现代浏览器，尤其是 Chrome 中，Canvas 拥有其他方式无法匹敌的渲染速度和 GPU 加速能力，但是由于 Canvas 较为低级的 API 设计，想用 Canvas 画出像样的东西需要做的准备工作相对要多了那么些。
:::

一个形如 `<canvas></canvas>` 的闭合标签或 `document.createElement('CANVAS')` 的返回值便是一个 **HTMLCanvasElement** 的实例，在本文的所有实验中，画布元素都是来自一个 `<canvas>` 标签，画布来自对元素的引用调用 `getContext('2d')`。  

通常画布元素 `canvasEle` 都是以 Html 标签的形式存在于文档流中，这样一来，我们对它的画布 `ctx` 的所有更新、操作都会实时地被浏览器实时呈现到你的显示器上。  

有些情况下，它也可以在某些时候动态地使用 `document.createElement('CANVAS')` 创建而不挂载到文档中，这样的仅存活在内存中的 `canvasEle` 可以帮助解决一些特殊的问题，比如转换图片为 base64 编码，或者给另一个 `ctx` 加速。  

Canvas 具有很多基本的绘图、变换、图像处理和像素控制方法，我们将仅用到 `beginPath`, `arc`, `closePath`, `fill` 这几个函数，以及 `fillStyle` 这个属性。  

#### beginPath 和 closePath

``` ts
void ctx.beginPath()
void ctx.closePath()
```

>`beginPath` 是 Canvas 2D API 通过清空**子路径**列表开始一个**新路径**的方法。  
当你想创建一个新的**路径**时，调用此方法。  

>`closePath` 是 Canvas 2D API 将笔点返回到当前**子路径**起始点的方法。  
它尝试从当前点到起始点绘制一条直线。  
如果图形已经是封闭的或者只有一个点，那么此方法不会做任何操作。

#### arc

``` ts
void ctx.arc(
  x: number, y: number,
  radius: number,
  startAngle: number, endAngle: number,
  anticlockwise: boolean
)
```

>`arc` 是 Canvas 2D API 绘制**圆弧路径**的方法。  
**圆弧路径**的圆心在 $<x, y>$ 位置，半径为 $r$ ，根据 *anticlockwise*（默认为顺时针）指定的方向从 *startAngle* 开始绘制，到 *endAngle* 结束。

#### fill 和 fillStyle

``` ts
void ctx.fill()
void ctx.fill(fillRule: 'nonzero' | 'evenodd')
void ctx.fill(path: Path2D, fillRule: 'nonzero' | 'evenodd')
ctx.fillStyle = someFillStyle as string | CanvasGradient | CanvasPattern
```

>`fill` 是 Canvas 2D API 根据当前的填充样式，填充当前或已存在的**路径**的方法。  
采取非零环绕 (nonzero) 或者奇偶环绕 (evenodd) 规则。  

>`fillStyle` 是Canvas 2D API 使用内部方式描述颜色和样式的属性。  
默认值是 `#000` （黑色）。

由此，我们可以给 `Particle` 添加 `render` 方法了：

``` js
render(ctx) {
  ctx.fillStyle = this.color.toRgba(1)

  ctx.beginPath()
  ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.fill()
}
```

## 试一试，模拟最基本的粒子运动过程

基于上述的理论，这里事先准备好了所需的工具和类，亲自动手试试吧！  

<CanvasPlayground
desc="（这是一个 45° 平抛的例子，尝试修改起始位置、速度或加速度，观察变化）"
desc2="* ctx 是事先准备好的画布，hdl 接受每次 requestAnimationFrame 的句柄。点击 run 将运行编辑框内的脚本，点击 stop 会销毁定时任务，点击 clear 会清空画布。
使用 requestAnimationFrame 是为了让画布每秒更新 60 次。"
desc3="** 这里使用了 stroke 来显示粒子的轨迹。"
js="const p = new Particle(
  /* 位置 */ new Vector2(5, 200),
  /* 速度 */ new Vector2(55, -55),
  /* 颜色 */ new Color(223, 223, 223),
  /* 质量 */ 1000
)
// 外部加速度，此处为重力
const acceleration = new Vector2(0, 9.8)
// δt，代表时间微分，增大这个值会让模拟变快，降低这个值会让模拟精度更高\n
const dt = 0.08\n
ctx.strokeStyle = p.color.toReversedRgba(1)\n
!(function loop() {
  p.position = p.position.add( p.velocity.multiply(dt) )
  p.velocity = p.velocity.add( acceleration.multiply(dt) )
  p.render(ctx)
  ctx.stroke()
  hdl = requestAnimationFrame(loop)
}())
"></CanvasPlayground>

## 粒子间的引力

当粒子的数量超过 1 个，情况就会变得复杂起来：目前为止我们都没有考虑粒子受力的情况。  

#### 万有引力的理论基础

设两个质点的质量分别为 $m1$, $m2$，并且在它们之间的距离为 $r$，则它们之间的万有引力 $F$ 为：

$$F = G \dfrac {m_{1}m_{2}}{r^{2}}$$

其中，$G$ 是万有引力常数，约为 $6.67408 \cdot 10^{-11} \dfrac {m^{3}}{kg \cdot s^{2}}$

#### 引力的简化和计算

为了适应我们创建的模型，现实中的一些常数需要在计算机系统中适当地缩放，先前我们在通过粒子的质量计算粒子的体积时已经使用了这样的方法。  
现实生活中我们很难察觉引力的作用，因为它太小了，为了使得引力的效应变得清晰可见，我们必须让万有引力常数变得足够大：  
在此我们把常数 $G$ 放大：  

``` js
const G = 6.67408
```

由此我们可以计算两个粒子的相互吸引力了：  

设有粒子 `p1` ，粒子 `p2`，  

则万有引力的计算方法为：

``` js
const GravitationForce = G * (p1.mass * p2.mass) / Particle.distancePow2(p1, p2)
```

抽象为函数：

``` js
function F_Gravitation(p1, p2) {
  return G * (p1.mass * p2.mass) / Particle.distancePow2(p1, p2)
}
```

#### 引力和加速度

现在，粒子受到了外力，它将由外力产生**动态**的加速度，而不是提前预设的**固定**加速度，我们现在来讨论引力环境下粒子的加速度的计算。  

考虑粒子 $p$，设有粒子的集合 $P=<p_{1},...,p_{n}>$ 且 $p\notin P$  
根据[第二节](#理论基础)的公式，易得：

$$\overrightarrow {a_{p}}=\sum ^{n}_{i=0}\dfrac {\overrightarrow {F_{G}}\left( p, p_{i}\right) }{m_{p}}$$

在实际情况中，粒子集合中是包含将要参与计算的粒子 `p` 的，写成 TypeScript 代码 ：  

``` ts
const particles: Particle[] = [p, ...]
```

在此直接给出每个计算周期粒子 `p` 的加速度的计算方法，需要理解的地方添加了注释：  

``` js
const totalGravitation = particles.reduce(
  (pv /* 从每个其他粒子上累积获得的加速度 */, cv /* 当前参与计算的目标粒子 */) => {
    // 对 particles 的循环会碰到 cv 就是 p 的情况，直接返回 pv
    if (p === cv) {
      return pv
    }
    else {
      // 计算引力加速度的数值大小
      const gravAcc = G * cv.mass / Particle.distancePow2(p, cv)
      // 计算引力加速度的方向，并与 gravAcc 合并为正确的加速度向量
      // 具体方法是先取 CO + OP，即 CO - PO，得到向量 CP，将其单位化
      // 并乘上模 gravAcc，得到目标向量
      const gravVec = Vector2.unit(cv.position.x - p.position.x, cv.position.y - p.position.y).multiply(gravAcc)
      // 累加到 pv
      return pv.add(gravVec)
    }
  },
  Vector2.zero /* reduce 的起始值，因为是累加，所以是零向量 */
)
// 因为我们的模型中粒子仅受引力，故每一刻的加速度就是计算出的引力加速度
p.acceleration = totalGravitation
```

## 试一试，模拟粒子间的引力

有了计算引力的公式，我们就可以在下面的实验里直观地观察引力了！  

<CanvasPlayground
desc="（这是一个带初速度的轻粒子被静止的重粒子吸引的例子，尝试修改初速度、质量或起始位置，观察变化）"
desc2="* gf 是工具函数，即上面的p的加速度计算方法，gf 依赖外部的 particles"
env="const G=6.67408;function gf(p){const totalGravitation=particles.reduce((pv,cv)=\\r{if(p===cv){return pv}else{const gravAcc=G*cv.mass/Particle.distancePow2(p,cv);const gravVec=Vector2.unit(cv.position.x-p.position.x,cv.position.y-p.position.y).multiply(gravAcc);return pv.add(gravVec)}},Vector2.zero);p.acceleration=totalGravitation}"
js="const particles = [
  new Particle(new Vector2(200, 180), new Vector2(0, 0), new Color(22, 33, 234), 1000),
  new Particle(new Vector2(25, 200), new Vector2(0, -4), new Color(234, 42, 12), 100),
  new Particle(new Vector2(125, 140), new Vector2(0, -6), new Color(194, 22, 242), 100)
]
const dt = 0.1\n
!(function loop() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  particles.forEach(p =\\r {
    gf(p)
    p.position = p.position.add( p.velocity.multiply(dt) )
    p.velocity = p.velocity.add( p.acceleration.multiply(dt) )
    p.render(ctx)
  })
  hdl = requestAnimationFrame(loop)
}())"></CanvasPlayground>

## 粒子间的碰撞

思考上文介绍的粒子的万有引力计算方法，不难发现有一种情况需要考虑：  
当两个粒子特别靠近时，$\overrightarrow {F_{G}}$ 将变得非常大，表现为两个粒子相互靠近，并以极快的速度弹出。  
在上面的实验中释放两个初速度为 0 的粒子便可观察到这一现象。  
为了避免这种情况的发生，我们必须引入碰撞检测以及碰撞后的处理。  

我们规定一个**最小距离**，当两个粒子的距离小于它们的**最小距离**，则我们认为发生了碰撞。

在此我们模仿天体物理中的[*洛希极限*](https://zh.wikipedia.org/wiki/%E6%B4%9B%E5%B8%8C%E6%A5%B5%E9%99%90)定义本文中的**粒子间的洛希极限** $d$：

$$d = 1.0134\left( r_{1}+r_{2}\right)$$

其中，$r_{1}$, $r_{2}$是两个粒子的半径。

实际计算中大多是取平方结果，于是我们为 `Particle` 添加静态方法：

``` js
Particle.RocheLimitPow2 = function (a, b) {
  return Math.pow((a.radius + b.radius) * 1.0134, 2)
}
```

碰撞的检测方式是对粒子进行简单的二次遍历。  
::: tip
由于在某些情况下粒子会超出画布范围，但我们仍需要对其进行模拟，所以在此我们不会使用*四叉树*法进行碰撞检测。
:::
举例说明，设第一层遍历到 `p` ，第二层遍历到 `pOther` 时：  
当 `Particle.distancePow2(p, pOther) < Particle.RocheLimitPow2(p, pOther)` 时，变认为碰撞发生。  

一般情况下，计算机粒子模拟时会有以下几种碰撞时的处理：

- 完全球弹性碰撞
- 完全矩形弹性碰撞
- 互相穿过
- 以某种方式合并

既然引入了洛希极限和引力，在本系统中我们将采用最后一种方式处理粒子间的碰撞  

**我们设定系统中的粒子过分接近时，会表现出重的那个粒子吸收轻的粒子的现象**  

即重的粒子完全获得轻粒子的**质量**和**动量**，并导致轻粒子死去。

下面直接给出 "吸收" 的代码：

``` js
class Particle {
...
  devourOther(pOther) {
    if (pOther.mass < this.mass && !this.dead && !pOther.dead) {
      this.velocity = this.velocity.multiply(this.mass).add(pOther.velocity.multiply(pOther.mass)).divide(this.mass + pOther.mass)
      this.mass += pOther.mass
      this.radius = Particle.massToRadius(this.mass)
      this.color = this.color.add(pOther.color)
      pOther.dead = true
    }
  }
...
}
```

可以注意到，重的粒子 "吸收" 过于靠近的轻的粒子这一过程是符合**动量守恒**的。

## 粒子系统 <Badge text="ParticleSystem" />

现在我们要引入**粒子系统**的概念  

粒子系统用来模拟大量的粒子，抽象一些粒子间的运算和状态变化，降低代码复杂度和耦合度。

我们要构建的粒子系统包含以下几个部分：

- 粒子的容器
- 万有引力模拟
- 运动模拟
- 粒子间的互动
- 游戏循环
- 粒子的激发（新增粒子）
- 粒子的消亡（移除粒子）
- 能容纳可插拔的特效，如完全弹性的围栏

由此我们就可以将上文的万有引力计算逻辑、粒子的运动模拟等搬到粒子系统中。

以下是粒子系统的实现：

``` js
class ParticleSystem {
  static G = 6.67408
  constructor(ctx, w, h) {
    this.w = w || ctx.canvas.width
    this.h = h || ctx.canvas.height
    this.particles = []
    this.context = ctx
    this.pauseSignal = false
    this.effectors = []
  }
  simulate(dt) {
    if (this.pauseSignal) return

    this.applyEffectors()
    this.devour()
    this.universalGravitation()
    this.kinematics(dt)
  }
  render() {
    for (const p of this.particles) {
      if (p.outOfScreen() || !p.visible) continue
      p.render(this.context)
    }
  }
}
```

上述的代码创建了粒子系统的基础框架，构造函数接受 1 个或 3 个参数，**CanvasRenderingContext2D** 类型的 `ctx` 是粒子系统依赖的渲染上下文，`w` 和 `h` 是粒子的宽高范围，如果未指定则取 `ctx` 的宽高，目前未使用到。  
`render` 方法完成一次全体粒子的绘制。  
::: warning
`render` 没有主动刷新 `ctx` ，如果不在外部使用 `ctx.clearRect` 方法刷新画布则会出现重影。  
之所以这么做是因为之后使用 `OffscreenCanvas` 等技术优化画布速度后无需再做刷新。
:::
`simulate` 方法完成一次全体粒子的运动及其他模拟和操作，参数 `dt` 为时间间隔量，内部涉及了 4 个方法，我们逐一分析：

#### applyEffectors

``` js
applyEffectors() {
  for (const effector of this.effectors) {
    const apply = effector.apply
    for (const p of this.particles) apply(p)
  }
}
```
`applyEffectors` 方法计算可插拔的特效。  
`effectors` 是一个用于存放效果插件的容器，每个插件都有 `apply` 方法，其接收一个参数 `p: Particle`。  
方法将遍历所有插件，并将效果应用到每个粒子上。

#### devour

``` js
devour() {
  this.particles.sort((a, b) => b.mass - a.mass).forEach((p, selfIndex, particlesRef) => {
    const foodCandidateIndex = []

    particlesRef
      .filter((pOther, innerIndex) => {
        if (p.mass <= pOther.mass) return
        if (p === pOther) return

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
```

`devour` 方法先将所有粒子按照**质量**排序，从最重的开始循环，在下一层循环中寻找可以吸收的轻粒子，标记它们并使用前述的 `devourOther` 方法吸收。

#### universalGravitation

``` js
universalGravitation() {
  this.particles.forEach((p, index) => {
    const totalGravitation = this.particles.reduce((pv, cv, innerIndex) => {
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
```

`universalGravitation` 方法对每个粒子应用[这里](#引力和加速度)给出的算法计算引力下的加速度。

#### kinematics

``` js
kinematics(dt) {
  for (const particle of this.particles) {
    particle.position = particle.position.add(particle.velocity.multiply(dt))
    particle.velocity = particle.velocity.add(particle.acceleration.multiply(dt))
  }
}
```

`kinematics` 方法对每个粒子应用[这里](#单个粒子的运动)讨论的算法进行运动模拟。

---
这里还有两个基础方法 `emit` 和 `remove`，他们封装了粒子的**激发**和**消亡**  
一般来说， `remove` 提供给粒子系统内部调用  
`emit` 提供给外部调用  

::: tip
粒子一旦被创建并 `emit` 入粒子系统，就应当仅受到粒子系统内部控制
:::

``` js
emit(particle) {
  this.particles.push(particle)
}
remove(index) {
  if (!this.particles[index] || !this.particles[index].dead) {
    return
  }
  this.particles[index] = this.particles[this.particles.length - 1]
  this.particles.pop()
}
```

::: tip
`remove` 中使用了一个小技巧  
`particles` 是无序的，所以我们可以让数组的最后一位和待删除的元素进行交换，再使用 `pop` 即可完成删除操作。
:::

## 试一试，使用粒子系统

<CanvasPlayground
desc="（这是一个完整的粒子系统的例子，可以看到每次绘图前会手动清空画布，尝试注释 ctx.clearRect... ，观察变化）"
desc2="* random 是随机数产生器，接受两个参数：上界和下界"
env="function random(lower,upper){return lower+(upper-lower)*Math.random();}"
js="const ps = new ParticleSystem(ctx)\n
for (let i = 0; i < 100; i++) {
  ps.emit(new Particle(
    new Vector2( random(0, ps.w), random(0, ps.h) ),
    new Vector2( random(-10, 10), random(-10, 10) ),
    Color.random(),
    random(100, 1000)
  ))
}\n
!(function loop() {
  ps.simulate(0.01)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ps.render()
  hdl = requestAnimationFrame(loop)
}())"></CanvasPlayground>

## 弹性围墙

目前为止还有一点比较糟糕：粒子很容易跑出画布的范围，然后我们就看不见它们了  
我们在粒子系统中预留了名为 `effectors` 的效果插件容器，现在我们可以着手构建我们的第一个插件：**弹性盒室**

``` js
class ChamberBox {
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
```

`ChamberBox` 是一个类，实例只有一个函数 `apply`，接受一个 `Particle` 类型参数 `particle` ——符合 `effectors` 的规范。  

简单来说，`ChamberBox` 的作用就是让碰到内壁的粒子翻转该方向的速度分量。可选的 `elasticCoefficient` 参数可以传入小于 1 的数，实际上它就是围墙的**弹性系数**，当未传递或传入 1 时，围墙是完全弹性的。

## 外部场

我们介绍第二个效果器：**外部场**

``` js
export class Field {
  constructor(dt, fieldAcc) {
    this.apply = particle => {
      particle.velocity = particle.velocity.add(fieldAcc(particle.position).multiply(dt))
    }
  }
}
```

`Field` 是一个外部的加速度场，对出于其中的粒子施加额外的加速度。  
其中，第二个参数 `fieldAcc` 有点难以理解，这是它的 TypeScript 定义：

``` ts
(position: Vector2) => Vector2
```

即 `fieldAcc` 接受每个粒子的**当前位置**矢量，并给出这个位置的**场矢量**，施加于此粒子。  

一个最简单的粒子就是竖直向下的均匀场（重力）了：

``` js
const Gravity = new Field(0.01, () => new Vector2(0, 9.8))
```

::: tip
`dt` 一般设置为 ParticleSystem 模拟时的值
:::

## 试一试，使用效果器

现在我们在上一个例子中加入 `ChamberBox` 和 `Field`，看看效果吧！

<CanvasPlayground
env="function random(lower,upper){return lower+(upper-lower)*Math.random();}"
js="const ps = new ParticleSystem(ctx), dt = 0.01
ps.effectors.push(new Field(dt, () =\\r new Vector2(0, 98 /* 此处使用了较大的值 */)))
ps.effectors.push(new ChamberBox(0, 0, ps.w, ps.h))\n
for (let i = 0; i < 300; i++) {
  ps.emit(new Particle(
    new Vector2( random(0, ps.w), random(0, ps.h) ),
    new Vector2( random(-30, 30), random(-30, 30) ),
    Color.random(),
    random(100, 1000)
  ))
}\n
!(function loop() {
  ps.simulate(dt)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ps.render()
  hdl = requestAnimationFrame(loop)
}())"></CanvasPlayground>

