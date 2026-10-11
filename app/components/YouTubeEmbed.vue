<script setup lang="ts">
const props = defineProps<{
  videoId: string;
  title: string;
}>();

const playing = ref(false);
const frame = useTemplateRef<HTMLIFrameElement>("frame");

async function play() {
  playing.value = true;
  await nextTick();
  frame.value?.focus();
}
</script>

<template>
  <div class="border-border relative aspect-video w-full overflow-hidden rounded border bg-black">
    <iframe
      v-if="playing"
      ref="frame"
      :src="youtubeEmbedUrl(props.videoId)"
      :title="props.title"
      class="absolute inset-0 size-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    />
    <button
      v-else
      type="button"
      class="group absolute inset-0 size-full"
      :aria-label="tplStr(t.talks.playVideo, { title: props.title })"
      @click="play"
    >
      <img
        :src="youtubeThumbnail(props.videoId)"
        alt=""
        loading="lazy"
        class="size-full object-cover"
      />
      <span
        aria-hidden="true"
        class="bg-accent text-accent-foreground absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full opacity-90 transition-transform group-hover:scale-110 group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" class="size-8 translate-x-0.5 fill-current">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  </div>
</template>
