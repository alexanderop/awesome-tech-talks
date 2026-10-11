<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="app-layout">
    <div
      class="border-border flex flex-col items-center justify-between border-t py-6 sm:flex-row-reverse sm:py-4"
    >
      <SocialLinks />
      <div
        class="my-2 flex flex-col items-center whitespace-nowrap sm:flex-row"
      >
        <NuxtLink to="/tags" class="hover:text-accent underline decoration-dashed underline-offset-4">{{ t.nav.tags }}</NuxtLink>
        <span class="hidden sm:inline">&nbsp;|&nbsp;</span>
        <span>{{ t.footer.copyright }} &#169; {{ currentYear }}</span>
        <span class="hidden sm:inline">&nbsp;|&nbsp;</span>
        <span>{{ t.footer.allRightsReserved }}</span>
      </div>
    </div>
  </footer>
</template>
