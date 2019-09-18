<template>
  <div>
    <div class="cs_row" v-for="func in check">
      <div :class="func.support ? 'display_sup is_support' : 'display_sup not_support'">{{ func.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BrowserFunctionTest',
  data() {
    return {
      check: [
        {
          name: 'OffscreenCanvas',
          support: 'OffscreenCanvas' in window
        },
        {
          name: 'OffscreenCanvasRenderingContext2D',
          support: 'OffscreenCanvasRenderingContext2D' in window && (function () {
              return !!(new OffscreenCanvas(100, 100).getContext('2d'))
            }())
        },
        {
          name: 'OffscreenCanvas.transferToImageBitmap()',
          support: 'OffscreenCanvas' in window && (function () {
              return !!(new OffscreenCanvas(100, 100).transferToImageBitmap)
            }())
        },
        {
          name: 'ImageBitmap',
          support: 'ImageBitmap' in window
        },
        {
          name: 'ImageBitmapRenderingContext',
          support: 'ImageBitmapRenderingContext' in window && (function () {
              return !!(document.createElement('canvas').getContext('bitmaprenderer'))
            }())
        },
        {
          name: 'ImageBitmapRenderingContext.transferFromImageBitmap()',
          support: 'ImageBitmapRenderingContext' in window && (function () {
              return !!(document.createElement('canvas').getContext('bitmaprenderer').transferFromImageBitmap)
            }())
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.display_sup {
  font-size: 1rem;
  line-height: 1.4;
  padding: .625rem 2rem;
  color: #383f44;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cs_row {
  position: relative;
  box-sizing: border-box;
  margin: .5rem 0;
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
.is_support {
  background-color: #95de64;
  &:hover {
    background-color: #b7eb8f;
  }
}
.not_support {
  background-color: #ff9c6e;
  &:hover {
    background-color: #ffbb96;
  }
}
</style>
