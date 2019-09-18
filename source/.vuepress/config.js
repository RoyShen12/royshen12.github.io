module.exports = {
  port: 8082,

  title: `A RoyShen blog`,
  description: '',
  head: [
    ['link', { rel: 'icon', href:'/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }]
  ],
  theme: 'cherry',
  themeConfig: {
    hostname: 'https://royshen12.github.io',
    docsRepo: 'royshen12/royshen12.github.io',
    docsDir: 'source',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Edit on GitHub',
    lastUpdated: 'Last Updated',
    serviceWorker: false,
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '文章列表',
        link: '/post/'
      },
      {
        text: '标签',
        link: '/tag/'
      },
      {
        text: '关于',
        link: '/about/'
      },
      {
        text: 'Github',
        link: 'https://github.com/RoyShen12/'
      }
    ],
    sidebar: false,
  },
  markdown: {
    lineNumbers: false,
    plugins: [
      'abbr',
      'footnote',
      'ins',
      'sub',
      'sup'
    ]
  },
  plugins: [
    ['@vuepress/google-analytics', {
      ga: 'UA-147134043-1'
    }],
    ['mathjax', {
      target: 'svg',
      macros: {
        '*': '\\times',
        '\\Z': '\\mathbb{Z}'
      }
    }],
    'nprogress'
  ]
}
