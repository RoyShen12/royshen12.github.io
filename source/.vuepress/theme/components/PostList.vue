<template lang="html">
  <div class="content">
    <h1>文章列表</h1>
    <ul>
      <li
        v-for="post of $site.pages.filter(({ id }) => id === 'post').sort((a, b) => a.frontmatter.date < b.frontmatter.date ? 1 : -1)"
        :key="post.key"
        style="margin: 16px 0; font-size: 1.2rem;"
      >
        <router-link :to="{ path: post.path }">
          {{ post.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
