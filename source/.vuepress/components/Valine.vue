<template>
  <div id="vcomments"></div>
</template>

<script>
export default {
  name: 'Valine',
  mounted() {
    // require window 
    const Valine = require('valine')
    if (typeof window !== 'undefined') {
      this.window = window
      window.AV = require('leancloud-storage')
    }
    new Valine({
      el: '#vcomments',
      appId: 'uy65knVI3trY9NrnpbQbQ1NB-9Nh9j0Va',
      appKey: 'CP2jaEdCflAoK8YyQWM1vl6L',
      notify: false,
      verify: false,
      avatar: 'mm',
      placeholder: 'Say something'
    })
  }
}
</script>
