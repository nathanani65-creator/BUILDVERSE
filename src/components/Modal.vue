<script setup>
defineProps({ title: { type: String, default: '' }, light: { type: Boolean, default: false }, wide: { type: Boolean, default: false } })
</script>

<template>
  <div class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal" :class="[light ? 'panel-light' : 'panel', { wide }]">
      <h2 v-if="title">{{ title }}</h2>
      <slot />
      <div class="actions"><slot name="actions" /></div>
    </div>
  </div>
</template>

<style scoped>
.wide { max-width: 760px; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
.actions:empty { display: none; }
</style>
