<script setup lang="ts">
interface SearchResultGroup {
  title: string
  items: Array<{
    id: string
    label: string
    meta: string
    typeLabel: string
  }>
}

defineProps<{
  query: string
  groups: SearchResultGroup[]
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  select: [resultId: string]
}>()
</script>

<template>
  <section class="topbar-panel topbar-search-panel panel-card panel-card--soft">
    <div class="topbar-panel__header">
      <div>
        <small>全站搜索</small>
        <h3>搜索游戏 / 帖子 / 频道 / 玩家</h3>
      </div>
      <span class="topbar-panel__hint">输入后实时展示结果</span>
    </div>

    <label class="topbar-field topbar-search-panel__field">
      <span>关键词</span>
      <input
        :value="query"
        type="text"
        placeholder="输入游戏、攻略、频道或玩家"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <div v-if="query.trim()" class="topbar-search-panel__groups">
      <section v-for="group in groups" :key="group.title" class="topbar-search-panel__group">
        <div class="topbar-search-panel__group-header">
          <strong>{{ group.title }}</strong>
          <span>{{ group.items.length }} 项</span>
        </div>

        <div v-if="group.items.length" class="topbar-search-panel__results">
          <button
            v-for="item in group.items"
            :key="item.id"
            class="topbar-search-panel__item"
            type="button"
            @click="emit('select', item.id)"
          >
            <div>
              <strong>{{ item.label }}</strong>
              <p>{{ item.meta }}</p>
            </div>
            <span>{{ item.typeLabel }}</span>
          </button>
        </div>
      </section>
    </div>

    <div v-else class="topbar-panel__empty">
      <strong>试试搜索热游、攻略或频道</strong>
      <p>例如：星海远征、攻略、截图、番茄舰长</p>
    </div>

    <div v-if="query.trim() && groups.every((group) => group.items.length === 0)" class="topbar-panel__empty">
      <strong>没有找到相关内容</strong>
      <p>可以换个关键词，或者直接去首页看看当前热门内容。</p>
    </div>
  </section>
</template>
