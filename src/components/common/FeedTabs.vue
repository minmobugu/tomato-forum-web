<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  tabs?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const defaultTabs = ['推荐', '热门', '最新']

function selectTab(tab: string) {
  if (tab !== props.modelValue) {
    emit('update:modelValue', tab)
  }
}
</script>

<template>
  <div class="feed-tabs">
    <button
      v-for="tab in tabs ?? defaultTabs"
      :key="tab"
      class="feed-tabs__item"
      :class="{ 'feed-tabs__item--active': tab === modelValue }"
      type="button"
      @click="selectTab(tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>
