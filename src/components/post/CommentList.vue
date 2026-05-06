<script setup lang="ts">
import { ref } from 'vue'

import SectionHeader from '../common/SectionHeader.vue'
import type { CommentItem } from '../../types/community'

const props = defineProps<{
  comments: CommentItem[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [content: string]
  reply: [commentId: number, content: string]
}>()

const draft = ref('')
const activeReplyId = ref<number | null>(null)
const replyDrafts = ref<Record<number, string>>({})

function toggleReply(commentId: number) {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId
}

function submitComment() {
  const content = draft.value.trim()
  if (!content) {
    return
  }

  emit('submit', content)
  draft.value = ''
}

function submitReply(commentId: number) {
  const content = replyDrafts.value[commentId]?.trim()
  if (!content) {
    return
  }

  emit('reply', commentId, content)
  replyDrafts.value[commentId] = ''
  activeReplyId.value = null
}

function updateReplyDraft(commentId: number, value: string) {
  replyDrafts.value = {
    ...replyDrafts.value,
    [commentId]: value,
  }
}
</script>

<template>
  <section class="panel-card comments-card">
    <SectionHeader class="comments-card__title" title="评论区" subtitle="来自社区玩家的热门讨论" />

    <div class="comments-editor panel-card panel-card--soft">
      <textarea
        :value="draft"
        class="comments-editor__textarea"
        rows="4"
        maxlength="2000"
        placeholder="写下你的评论"
        @input="draft = ($event.target as HTMLTextAreaElement).value"
      />
      <div class="comments-editor__actions">
        <span>{{ draft.trim().length }} / 2000</span>
        <button class="primary-button" type="button" :disabled="isSubmitting" @click="submitComment">发表评论</button>
      </div>
    </div>

    <div class="comments-card__list">
      <article v-for="comment in props.comments" :key="comment.id" class="comment-item panel-card panel-card--soft">
        <div class="comment-item__avatar-wrap">
          <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-item__avatar" />
          <span v-if="comment.author.isOnline" class="post-card__online-dot"></span>
        </div>
        <div class="comment-item__content">
          <div class="comment-item__header">
            <strong>{{ comment.author.name }}</strong>
            <span>{{ comment.author.level }}</span>
            <time>{{ comment.publishTime }}</time>
          </div>
          <p>{{ comment.content }}</p>
          <div class="comment-item__footer">
            <small>点赞 {{ comment.likes }}</small>
            <small>回复 {{ comment.replyCount }}</small>
            <button class="text-action" type="button" @click="toggleReply(comment.id)">回复</button>
          </div>

          <div v-if="activeReplyId === comment.id" class="comment-reply-editor">
            <textarea
              :value="replyDrafts[comment.id] ?? ''"
              class="comments-editor__textarea"
              rows="3"
              maxlength="2000"
              :placeholder="`回复 ${comment.author.name}`"
              @input="updateReplyDraft(comment.id, ($event.target as HTMLTextAreaElement).value)"
            />
            <div class="comments-editor__actions">
              <span>{{ (replyDrafts[comment.id] ?? '').trim().length }} / 2000</span>
              <button class="primary-button" type="button" :disabled="isSubmitting" @click="submitReply(comment.id)">
                发送回复
              </button>
            </div>
          </div>

          <div v-if="comment.replies.length" class="comment-replies">
            <article v-for="reply in comment.replies" :key="reply.id" class="comment-reply">
              <div class="comment-item__header">
                <strong>{{ reply.author.name }}</strong>
                <span>{{ reply.author.level }}</span>
                <time>{{ reply.publishTime }}</time>
              </div>
              <p>{{ reply.content }}</p>
            </article>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.comments-editor,
.comment-reply-editor {
  display: grid;
  gap: 12px;
}

.comments-editor__textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  padding: 12px 14px;
  resize: vertical;
}

.comments-editor__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}

.comment-replies {
  display: grid;
  gap: 10px;
  margin-top: 12px;
  padding-left: 16px;
  border-left: 1px solid var(--line);
}

.comment-reply {
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
}
</style>
