<script setup lang="ts">
const props = defineProps<{
  options: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectOption(option: string) {
  if (option !== props.modelValue) {
    emit('update:modelValue', option)
  }
}
</script>

<template>
  <div class="feed-filter-row">
    <button
      v-for="option in options"
      :key="option"
      class="filter-chip"
      :class="{ 'filter-chip--active': option === modelValue }"
      type="button"
      @click="selectOption(option)"
    >
      {{ option }}
    </button>
  </div>
</template>
