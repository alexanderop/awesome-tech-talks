<script setup lang="ts">
const route = useRoute();
const { toggle } = useTheme();

const menuExpanded = ref(false);

const navItems = [
  { to: "/talks", label: t.nav.talks },
  { to: "/articles", label: t.nav.articles },
  { to: "/channels", label: t.nav.channels },
  { to: "/people", label: t.nav.people },
  { to: "/tags", label: t.nav.tags },
  { to: "/about", label: t.nav.about },
];

const currentPath = computed(() => {
  const path = route.path;
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
});

function isActive(path: string) {
  const currentTopSegment = currentPath.value.split("/").find(p => p.trim());
  const topSegment = path.split("/").find(p => p.trim());
  return currentPath.value === path || currentTopSegment === topSegment;
}

function toggleMenu() {
  menuExpanded.value = !menuExpanded.value;
}

// Close the mobile menu after navigation.
watch(
  () => route.path,
  () => {
    menuExpanded.value = false;
  }
);
function focusMain() {
  const main = document.getElementById("main-content");
  if (!main) return;
  main.setAttribute("tabindex", "-1");
  main.focus();
  main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
}
</script>

<template>
  <a
    id="skip-to-content"
    href="#main-content"
    @click="focusMain"
    class="bg-background text-accent absolute inset-s-16 -top-full z-50 px-3 py-2 backdrop-blur-lg transition-all focus:top-4"
  >
    {{ t.a11y.skipToContent }}
  </a>

  <header
    class="app-layout flex flex-col items-center justify-between md:flex-row"
  >
    <div
      class="border-border bg-background relative flex w-full items-baseline justify-between border-b py-4 md:items-center md:py-6"
    >
      <NuxtLink
        to="/"
        class="absolute py-1 text-xl leading-8 font-semibold whitespace-nowrap md:static md:my-auto md:leading-none"
      >
        {{ SITE.title }}
      </NuxtLink>
      <nav
        id="nav-menu"
        class="flex w-full flex-col items-center md:ms-2 md:flex-row md:justify-end md:space-x-4 md:py-0"
      >
        <button
          id="menu-btn"
          class="focus-outline self-end p-2 md:hidden"
          :aria-label="menuExpanded ? t.a11y.closeMenu : t.a11y.openMenu"
          :aria-expanded="menuExpanded"
          aria-controls="menu-items"
          @click="toggleMenu"
        >
          <IconX v-if="menuExpanded" />
          <IconMenuDeep v-else />
        </button>
        <ul
          id="menu-items"
          :class="[
            menuExpanded ? 'grid' : 'hidden',
            '[&>li>a]:hover:text-accent mt-4 w-44 grid-cols-2 place-content-center gap-2 md:mt-0 md:flex md:w-auto md:gap-x-1 md:gap-y-0 md:[&>li]:h-8 [&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium md:[&>li>a]:px-1.5 md:[&>li>a]:py-1',
          ]"
        >
          <li v-for="item in navItems" :key="item.to" class="col-span-2">
            <NuxtLink :to="item.to" :class="{ 'active-nav': isActive(item.to) }">
              {{ item.label }}
            </NuxtLink>
          </li>
          <li
            v-if="FEATURES.search"
            class="col-span-1 flex items-center justify-center"
          >
            <LinkButton
              href="/search"
              class="focus-outline relative size-8"
              :title="t.nav.search"
              :aria-label="t.nav.search"
            >
              <IconSearch
                class="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2"
              />
              <span class="sr-only">{{ t.nav.search }}</span>
              <IconUnderline
                v-if="isActive('/search')"
                aria-hidden="true"
                class="absolute bottom-0 w-6 scale-125 max-md:inset-s-2"
              />
            </LinkButton>
          </li>
          <li
            v-if="FEATURES.lightAndDarkMode"
            class="col-span-1 flex items-center justify-center"
          >
            <button
              id="theme-btn"
              class="focus-outline hover:[&>svg]:stroke-accent relative size-12 p-4 md:size-8"
              :title="t.a11y.toggleTheme"
              aria-live="polite"
              :aria-label="t.a11y.toggleTheme"
              @click="toggle"
            >
              <IconMoon
                class="absolute top-[50%] left-[50%] translate-[-50%] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <IconSunHigh
                class="absolute top-[50%] left-[50%] translate-[-50%] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
