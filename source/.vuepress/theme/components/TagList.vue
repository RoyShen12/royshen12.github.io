<template lang="html">
  <div class="content">
    <h1>Tags</h1>
    <span v-for="tag of $frontmatterKey.list.sort((a, b) => a.name > b.name ? 1 : -1)" :key="tag.name">
      <h3 :id="tag.name">
        <router-link
          :to="{ path: `./#${tag.name}` }"
          class="header-anchor"
          aria-hidden="true"
        >
          #
        </router-link>
        {{ tag.name }}
      </h3>
      <ul>
        <li v-for="page of tag.pages.filter(({ id }) => id === 'post').sort((a, b) => a.frontmatter.date < b.frontmatter.date ? 1 : -1)" :key="page.key">
          <router-link :to="{ path: page.path }">
            {{ page.title }}
          </router-link>
        </li>
      </ul>
    </span>
  </div>
</template>
