<script setup>
// "1. Find Words → 2. Place Items → 3. Rewards" — shows where the player is in a round.
defineProps({ step: { type: Number, required: true } })
const STEPS = ['Find Words', 'Place Items', 'Rewards']
</script>

<template>
  <ol class="steps" aria-label="Round steps">
    <template v-for="(s, i) in STEPS" :key="s">
      <li :class="{ now: step === i + 1, done: step > i + 1 }" :aria-current="step === i + 1 ? 'step' : undefined">
        <span class="n">{{ step > i + 1 ? '✓' : i + 1 }}</span>
        <span class="t">{{ s }}</span>
      </li>
      <li v-if="i < STEPS.length - 1" class="arrow" aria-hidden="true">→</li>
    </template>
  </ol>
</template>

<style scoped>
.steps { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
.steps li { display: flex; align-items: center; gap: 6px; font-weight: 900; font-size: 15px; color: #fff; text-shadow: 1px 1px 0 var(--ink); opacity: .75; }
.steps li.now, .steps li.done { opacity: 1; }
.n { width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; background: #6d6d6d; border: 2px solid var(--ink); font-size: 13px; text-shadow: none; }
.now .n { background: var(--gold); color: var(--ink); animation: pulse 1.6s infinite; }
.done .n { background: var(--good); }
.now .t { text-decoration: underline; text-underline-offset: 4px; }
.arrow { opacity: .8; }
@media (max-width: 420px) { .steps li { font-size: 13px; } }
</style>
