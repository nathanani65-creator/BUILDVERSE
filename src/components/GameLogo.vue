<script setup>
defineProps({ small: { type: Boolean, default: false } })
</script>

<template>
  <div class="logo" :class="{ small }">
    <div class="word"><span class="build">BUILD</span><span class="verse">VERSE</span></div>
    <div v-if="!small" class="tag">DESIGN <i>■</i> DECORATE <i>■</i> CREATE</div>
  </div>
</template>

<style scoped>
.logo { text-align: center; user-select: none; }
.word { font-family: var(--font-title); font-size: clamp(34px, 7vw, 72px); line-height: 1.1; letter-spacing: 2px; }
.build, .verse { -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; }
.build {
  color: #d9d9d9;
  text-shadow: 0 4px 0 #8b8b8b, 0 8px 0 #555, 0 10px 0 var(--ink), 6px 12px 0 rgba(0,0,0,.25);
}
.verse {
  color: #8bd14b;
  text-shadow: 0 4px 0 #4f9a2a, 0 8px 0 #2e6b1a, 0 10px 0 var(--ink), 6px 12px 0 rgba(0,0,0,.25);
}
.tag {
  display: inline-block; margin-top: 18px; padding: 8px 18px;
  background: var(--wood); color: #ffeac2; border: 3px solid var(--wood-dark);
  font-family: var(--font-title); font-size: clamp(10px, 1.6vw, 14px); letter-spacing: 2px;
  box-shadow: inset 3px 3px 0 var(--wood-light), 0 4px 0 rgba(0,0,0,.3);
}
.tag i { color: var(--gold); font-style: normal; font-size: .7em; vertical-align: middle; }
.small .word { font-size: 18px; }
.small .build, .small .verse { -webkit-text-stroke: 1.5px var(--ink); }
.small .build { text-shadow: 0 2px 0 #555, 0 3px 0 var(--ink); }
.small .verse { text-shadow: 0 2px 0 #2e6b1a, 0 3px 0 var(--ink); }
</style>
