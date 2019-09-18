export default (
  {
      Vue, // the version of Vue being used in the VuePress app
      options, // the options for the root Vue instance
      router, // the router instance for the app
      siteData, // site metadata
  },
) => {
  // console.log(siteData)
  Vue.component('codemirror', async () => {
      // This module will export a function configuring codemirror component
      
      const [install] = await Promise.all([
        await import('./codemirror.js'),
        await import('../../node_modules/codemirror/mode/javascript/javascript'),
        await import('../../node_modules/codemirror/lib/codemirror.css'),
        await import('./codemirror.vsdark.css')
      ])

      return install.default({
        options: {
          tabSize: 2,
          indentWithTabs: true,
          lineNumbers: true,
          lineWrapping: true,
          line: true,
          showCursorWhenSelecting: true,
          viewportMargin: Infinity
        }
      })
  })
}
