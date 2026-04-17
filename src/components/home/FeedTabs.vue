<script setup lang="ts">
const props = defineProps<{
  modelValue: '推荐' | '热门' | '最新'
}>()

const emit = defineEmits<{
  'update:modelValue': ['推荐' | '热门' | '最新']
}>()

const tabs: Array<'推荐' | '热门' | '最新'> = ['推荐', '热门', '最新']

function selectTab(tab: '推荐' | '热门' | '最新') {
  if (tab !== props.modelValue) {
    emit('update:modelValue', tab)
  }
}
</script>

<template>
  <div class="feed-tabs">
    <button
      v-for="tab in tabs"
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
