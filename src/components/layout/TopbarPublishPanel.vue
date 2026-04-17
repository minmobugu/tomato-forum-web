<script setup lang="ts">
import type { CreatePostDraft } from '../../types/community'

defineProps<{
  draft: CreatePostDraft
  games: string[]
}>()

const emit = defineEmits<{
  update: [field: keyof CreatePostDraft, value: string]
  submit: []
  'add-images': [files: FileList | null]
  'add-videos': [files: FileList | null]
  'remove-image': [mediaId: string]
  'remove-video': [mediaId: string]
}>()

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  emit('add-images', input.files)
  input.value = ''
}

function handleVideoChange(event: Event) {
  const input = event.target as HTMLInputElement
  emit('add-videos', input.files)
  input.value = ''
}
</script>

<template>
  <section class="topbar-panel topbar-publish-panel panel-card panel-card--soft">
    <div class="topbar-panel__header">
      <div>
        <small>发布内容</small>
        <h3>把你的攻略、评测或创作发到社区</h3>
      </div>
      <span class="topbar-panel__hint">提交后会立即写入本地内容流</span>
    </div>

    <div class="topbar-publish-panel__form">
      <label class="topbar-field">
        <span>标题</span>
        <input :value="draft.title" type="text" placeholder="输入帖子标题" @input="emit('update', 'title', ($event.target as HTMLInputElement).value)" />
      </label>

      <div class="topbar-publish-panel__grid">
        <label class="topbar-field">
          <span>所属游戏</span>
          <select :value="draft.game" @change="emit('update', 'game', ($event.target as HTMLSelectElement).value)">
            <option value="">选择游戏</option>
            <option v-for="game in games" :key="game" :value="game">{{ game }}</option>
          </select>
        </label>

        <label class="topbar-field">
          <span>话题</span>
          <input :value="draft.topic" type="text" placeholder="如：开荒攻略" @input="emit('update', 'topic', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>

      <label class="topbar-field">
        <span>摘要</span>
        <textarea :value="draft.summary" rows="3" placeholder="一句话说明内容价值" @input="emit('update', 'summary', ($event.target as HTMLTextAreaElement).value)"></textarea>
      </label>

      <div class="topbar-publish-panel__media-grid">
        <section class="topbar-publish-panel__media-block">
          <div class="topbar-publish-panel__media-header">
            <div>
              <strong>图片</strong>
              <p>最多上传 16 张图片</p>
            </div>
            <span>{{ draft.images.length }} / 16</span>
          </div>
          <label class="topbar-publish-panel__upload">
            <input accept="image/*" multiple type="file" @change="handleImageChange" />
            <span>选择图片</span>
          </label>
          <div v-if="draft.images.length" class="topbar-publish-panel__image-list">
            <article v-for="image in draft.images" :key="image.id" class="topbar-publish-panel__image-item">
              <img :src="image.url" :alt="image.name" />
              <button type="button" @click="emit('remove-image', image.id)">移除</button>
            </article>
          </div>
        </section>

        <section class="topbar-publish-panel__media-block">
          <div class="topbar-publish-panel__media-header">
            <div>
              <strong>视频</strong>
              <p>最多上传 4 个视频</p>
            </div>
            <span>{{ draft.videos.length }} / 4</span>
          </div>
          <label class="topbar-publish-panel__upload">
            <input accept="video/*" multiple type="file" @change="handleVideoChange" />
            <span>选择视频</span>
          </label>
          <div v-if="draft.videos.length" class="topbar-publish-panel__video-list">
            <article v-for="video in draft.videos" :key="video.id" class="topbar-publish-panel__video-item">
              <video :poster="video.poster" :src="video.url" controls preload="metadata"></video>
              <div class="topbar-publish-panel__video-meta">
                <span>{{ video.name }}</span>
                <button type="button" @click="emit('remove-video', video.id)">移除</button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <label class="topbar-field">
        <span>正文</span>
        <textarea :value="draft.content" rows="6" placeholder="输入正文，支持分段换行" @input="emit('update', 'content', ($event.target as HTMLTextAreaElement).value)"></textarea>
      </label>

      <div class="topbar-publish-panel__actions">
        <button class="primary-button" type="button" @click="emit('submit')">立即发布</button>
      </div>
    </div>
  </section>
</template>
