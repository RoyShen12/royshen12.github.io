module.exports = (options, ctx) => {
  const {
    archiveURL = '/post/',
  } = options

  return {
    async ready () {
      const archivePage = {
        path: archiveURL,
        regularPath: archiveURL,
        frontmatter: {
          title: '文章列表',
          layout: 'Posts',
        }
      }
      await ctx.addPage(archivePage)
    }
  }
}
