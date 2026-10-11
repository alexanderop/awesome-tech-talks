<script setup lang="ts">
const source = { x: 56, y: 165 };

const experiments = [
  [122, 92], [150, 128], [138, 214], [176, 76], [196, 246], [212, 150],
  [232, 108], [242, 204], [266, 80], [276, 238], [292, 136], [300, 196],
  [318, 98], [322, 252], [186, 186], [258, 172],
] as const;

const winner = { x: 318, y: 165 };

const drops = [
  { path: "M56,165 Q120,70 176,76 L176,330", begin: "0s" },
  { path: "M56,165 Q130,250 196,246 L196,330", begin: "1.3s" },
  { path: "M56,165 Q200,86 266,80 L266,330", begin: "2.6s" },
];

const gates = [
  { x: 378, n: "1", label: "used again?" },
  { x: 412, n: "2", label: "10× better?" },
  { x: 446, n: "3", label: "affordable?" },
];

const roadmap = [
  { x: 500, y: 82, w: 120 },
  { x: 540, y: 112, w: 140 },
  { x: 506, y: 212, w: 92 },
  { x: 560, y: 242, w: 120 },
];

function trail(x: number, y: number) {
  return `M${source.x},${source.y} Q${(source.x + x) / 2},${y + (y < source.y ? -30 : 30)} ${x},${y}`;
}
</script>

<template>
  <figure class="lab-pipeline not-prose my-8" data-pagefind-ignore>
    <div class="overflow-x-auto">
      <svg
        viewBox="0 0 720 404"
        role="img"
        aria-labelledby="lab-pipeline-title lab-pipeline-desc"
        class="block w-full min-w-[560px]"
      >
        <title id="lab-pipeline-title">The research pipeline: from lab to product</title>
        <desc id="lab-pipeline-desc">
          A new model drops and a pirate fires many experiments into the lab. About 90 percent fall into a bin
          and get recycled as posts, demos and an early-adopter program. One winner passes three gates (used again,
          ten times better, affordable) and becomes a new bar on the product roadmap.
        </desc>

        <text x="16" y="36" class="heading">LAB</text>
        <text x="52" y="36" class="muted">· explore, diverge</text>
        <text x="412" y="36" text-anchor="middle" class="heading">GATES</text>
        <text x="480" y="36" class="heading accent">PRODUCT</text>
        <text x="548" y="36" class="muted">· exploit, converge</text>

        <rect x="16" y="50" width="330" height="230" rx="14" class="lab-zone" />
        <rect x="480" y="50" width="224" height="230" rx="14" class="product-zone" />

        <path
          v-for="([x, y], i) in experiments"
          :key="`t${i}`"
          :d="trail(x, y)"
          class="trail"
        />
        <path :d="trail(winner.x, winner.y)" class="trail winner-trail" />

        <circle
          v-for="([x, y], i) in experiments"
          :key="`e${i}`"
          :cx="x"
          :cy="y"
          r="5"
          class="experiment"
        />

        <g :transform="`translate(${source.x} ${source.y})`">
          <circle r="14" class="source-halo" />
          <circle r="8" class="source" />
          <text y="-24" text-anchor="middle" class="small">new model</text>
          <text y="34" text-anchor="middle" class="small strong">pirate</text>
        </g>

        <path
          v-for="x in [120, 195, 270]"
          :key="`d${x}`"
          :d="`M${x},284 v14`"
          class="drop-arrow"
          marker-end="url(#lab-pipeline-arrow)"
        />
        <rect x="70" y="306" width="250" height="62" rx="10" class="bin" />
        <text x="195" y="331" text-anchor="middle" class="strong">≈90% thrown away</text>
        <text x="195" y="353" text-anchor="middle" class="small">→ posts, demos, early adopters</text>

        <path :d="`M${winner.x},${winner.y} H520`" class="lane" />
        <g v-for="gate in gates" :key="gate.n">
          <path :d="`M${gate.x},130 V152 M${gate.x},178 V200`" class="gate" />
          <text :x="gate.x" y="120" text-anchor="middle" class="small strong">{{ gate.n }}</text>
        </g>
        <text
          v-for="(gate, i) in gates"
          :key="`l${gate.n}`"
          x="362"
          :y="300 + i * 20"
          class="small"
        >{{ gate.n }} {{ gate.label }}</text>

        <circle :cx="winner.x" :cy="winner.y" r="7" class="winner" />
        <text :x="winner.x" :y="winner.y + 26" text-anchor="middle" class="small accent">winner</text>

        <text x="496" y="68" class="small">roadmap</text>
        <rect
          v-for="(bar, i) in roadmap"
          :key="`r${i}`"
          :x="bar.x"
          :y="bar.y"
          :width="bar.w"
          height="14"
          rx="7"
          class="bar"
        />
        <rect x="520" y="158" width="168" height="14" rx="7" class="bar new-bar" />
        <text x="604" y="168.5" text-anchor="middle" class="bar-label">kate pass</text>
        <text x="592" y="192" text-anchor="middle" class="small">architect hardens it</text>

        <text x="592" y="300" text-anchor="middle" class="strong accent">≈10% adopted</text>
        <text x="592" y="320" text-anchor="middle" class="small">merged into the product</text>

        <text x="360" y="396" text-anchor="middle" class="muted">
          pirate + architect = a two-slice team · a lab can be one person
        </text>

        <g class="motion">
          <circle v-for="drop in drops" :key="drop.begin" r="4" class="traveller">
            <animateMotion :path="drop.path" dur="3.9s" :begin="drop.begin" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.8;1"
              dur="3.9s"
              :begin="drop.begin"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="5" class="traveller winner-traveller">
            <animateMotion path="M56,165 Q187,135 318,165 H604" dur="5.2s" begin="0.6s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.9;1"
              dur="5.2s"
              begin="0.6s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        <defs>
          <marker id="lab-pipeline-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" class="arrow-head" />
          </marker>
        </defs>
      </svg>
    </div>
    <figcaption class="text-muted-foreground mt-2 text-center text-sm">
      Explore wide in the lab, promote through explicit gates, merge the few winners into the roadmap.
    </figcaption>
  </figure>
</template>

<style scoped>
svg {
  font-family: var(--font-app);
  font-size: 12px;
}

text {
  fill: var(--muted-foreground);
}

.heading {
  fill: var(--foreground);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.strong {
  fill: var(--foreground);
  font-weight: 600;
}

.small {
  font-size: 11px;
}

.accent,
.heading.accent {
  fill: var(--accent);
}

.lab-zone {
  fill: none;
  stroke: var(--muted-foreground);
  stroke-dasharray: 4 5;
  opacity: 0.6;
}

.product-zone {
  fill: color-mix(in srgb, var(--accent) 6%, transparent);
  stroke: var(--accent);
  stroke-width: 1.5;
}

.trail {
  fill: none;
  stroke: var(--muted-foreground);
  stroke-width: 1;
  opacity: 0.25;
}

.winner-trail {
  stroke: var(--accent);
  stroke-width: 1.5;
  opacity: 0.8;
}

.experiment {
  fill: var(--background);
  stroke: var(--muted-foreground);
  stroke-width: 1.5;
  opacity: 0.7;
}

.source {
  fill: var(--foreground);
}

.source-halo {
  fill: none;
  stroke: var(--foreground);
  stroke-dasharray: 2 3;
  opacity: 0.5;
}

.drop-arrow {
  stroke: var(--muted-foreground);
  stroke-width: 1.5;
}

.arrow-head {
  fill: var(--muted-foreground);
}

.bin {
  fill: var(--muted);
  fill-opacity: 0.35;
  stroke: var(--muted-foreground);
  stroke-dasharray: 4 5;
}

.lane {
  stroke: var(--accent);
  stroke-width: 2;
  stroke-dasharray: 6 6;
  animation: march 1.2s linear infinite;
}

.gate {
  stroke: var(--foreground);
  stroke-width: 3;
  stroke-linecap: round;
}

.winner {
  fill: var(--accent);
}

.bar {
  fill: var(--muted);
}

.new-bar {
  fill: var(--accent);
}

.bar-label {
  fill: var(--accent-foreground);
  font-size: 10px;
  font-weight: 600;
}

.traveller {
  fill: var(--muted-foreground);
  opacity: 0;
}

.winner-traveller {
  fill: var(--accent);
}

@keyframes march {
  to {
    stroke-dashoffset: -12;
  }
}

@media (prefers-reduced-motion: reduce) {
  .motion {
    display: none;
  }

  .lane {
    animation: none;
  }
}
</style>
