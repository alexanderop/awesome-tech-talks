<script setup lang="ts">
usePageSeo({ title: `${t.pages.channelsTitle} | ${SITE.title}`, description: t.pages.channelsDesc });
useRememberBackUrl();

const { data: talks } = await useAllTalks();
const channels = computed(() => getTalkChannels(talks.value, followedChannels));

const linkClass = "hover:text-accent underline decoration-dashed underline-offset-4";
</script>

<template>
  <BreadcrumbNav />

  <PageMain :page-title="t.pages.channelsTitle" :page-desc="t.pages.channelsDesc">
    <ul>
      <li
        v-for="channel in channels"
        :key="channel.id"
        class="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b py-3 last:border-b-0"
      >
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h2 class="text-lg font-medium">{{ channel.name }}</h2>
          <span class="text-muted-foreground text-sm">
            {{ channel.count === 1 ? t.talks.talkCountOne : tplStr(t.talks.talkCount, { count: String(channel.count) }) }}
          </span>
        </div>
        <div class="flex gap-x-4 text-sm">
          <NuxtLink
            v-if="channel.count > 0"
            :to="{ path: '/talks', query: { channel: channel.id } }"
            :class="linkClass"
          >{{ t.talks.viewTalks }}</NuxtLink>
          <LinkButton :href="`https://www.youtube.com/channel/${channel.id}`" :class="linkClass">{{ t.talks.youtubeLink }}</LinkButton>
        </div>
      </li>
    </ul>
  </PageMain>
</template>
