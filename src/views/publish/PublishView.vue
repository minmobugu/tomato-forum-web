<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import SidebarCard from '../../components/common/SidebarCard.vue'
import TopbarPublishPanel from '../../components/layout/TopbarPublishPanel.vue'
import { useCommunityStore } from '../../stores/community'
import type { CreatePostDraft, PostMediaItem } from '../../types/community'

const IMAGE_LIMIT = 16
const VIDEO_LIMIT = 4
const VIDEO_POSTER = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'

const router = useRouter()
const store = useCommunityStore()
const { featuredGames } = storeToRefs(store)
const draft = ref<CreatePostDraft>({
  title: '',
  game: '',
  topic: '',
  summary: '',
  content: '',
  images: [],
  videos: [],
})

const gameNames = computed(() => featuredGames.value.map((game) => game.name))

function revokeMediaUrls(items: PostMediaItem[]) {
  for (const item of items) {
    if (item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url)
    }
  }
}

function resetDraft() {
  revokeMediaUrls(draft.value.images)
  revokeMediaUrls(draft.value.videos)

  draft.value = {
    title: '',
    game: gameNames.value[0] ?? '',
    topic: '',
    summary: '',
    content: '',
    images: [],
    videos: [],
  }
}

function updateDraft(field: keyof CreatePostDraft, value: string) {
  draft.value = {
    ...draft.value,
    [field]: value,
  }
}

function createMediaItem(file: File, type: 'image' | 'video'): PostMediaItem {
  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    url: URL.createObjectURL(file),
    name: file.name,
    poster: type === 'video' ? VIDEO_POSTER : undefined,
  }
}

function appendImages(files: FileList | null) {
  if (!files?.length) return

  const available = IMAGE_LIMIT - draft.value.images.length
  if (available <= 0) return

  const nextItems = Array.from(files)
    .slice(0, available)
    .map((file) => createMediaItem(file, 'image'))

  draft.value = {
    ...draft.value,
    images: [...draft.value.images, ...nextItems],
  }
}

function appendVideos(files: FileList | null) {
  if (!files?.length) return

  const available = VIDEO_LIMIT - draft.value.videos.length
  if (available <= 0) return

  const nextItems = Array.from(files)
    .slice(0, available)
    .map((file) => createMediaItem(file, 'video'))

  draft.value = {
    ...draft.value,
    videos: [...draft.value.videos, ...nextItems],
  }
}

function removeImage(mediaId: string) {
  const image = draft.value.images.find((item) => item.id === mediaId)
  if (!image) return

  revokeMediaUrls([image])
  draft.value = {
    ...draft.value,
    images: draft.value.images.filter((item) => item.id !== mediaId),
  }
}

function removeVideo(mediaId: string) {
  const video = draft.value.videos.find((item) => item.id === mediaId)
  if (!video) return

  revokeMediaUrls([video])
  draft.value = {
    ...draft.value,
    videos: draft.value.videos.filter((item) => item.id !== mediaId),
  }
}

async function handleSubmit() {
  const currentDraft = draft.value
  if (!currentDraft.title || !currentDraft.game || !currentDraft.topic || !currentDraft.summary || !currentDraft.content) {
    return
  }

  const post = store.publishPost(currentDraft)
  draft.value = {
    title: '',
    game: gameNames.value[0] ?? '',
    topic: '',
    summary: '',
    content: '',
    images: [],
    videos: [],
  }
  await router.push(`/post/${post.id}`)
}

onMounted(async () => {
  if (!featuredGames.value.length) {
    await store.bootstrapHome()
  }

  resetDraft()
})

onBeforeUnmount(() => {
  revokeMediaUrls(draft.value.images)
  revokeMediaUrls(draft.value.videos)
})
</script>

<template>
  <div class="page-grid page-grid--compact publish-page">
    <section class="content-stack content-stack--compact">
      <TopbarPublishPanel
        :draft="draft"
        :games="gameNames"
        @add-images="appendImages"
        @add-videos="appendVideos"
        @remove-image="removeImage"
        @remove-video="removeVideo"
        @update="updateDraft"
        @submit="handleSubmit"
      />
    </section>

    <aside class="sidebar-stack sidebar-stack--compact">
      <SidebarCard title="发布建议" description="更容易获得互动的写法">
        <ul class="simple-list">
          <li>标题先说清楚玩法阶段或结论，用户更容易判断是否值得点进来。</li>
          <li>摘要尽量写出内容价值，例如适用版本、阵容强度或营地思路。</li>
          <li>正文按段落拆开后会直接写进帖子详情页，适合用来组织步骤和重点。</li>
        </ul>
      </SidebarCard>
    </aside>
  </div>
</template>
