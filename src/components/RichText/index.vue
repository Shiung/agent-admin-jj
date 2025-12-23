<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore - dompurify 缺少类型声明
import DOMPurify from 'dompurify'

type Props = {
  html?: string | null
  /** 是否啟用清洗（預設 true，除非你 100% 確認來源安全） */
  sanitize?: boolean
  /** 額外允許的 tag（例如 iframe） */
  allowTags?: string[]
  /** 額外允許的 attribute */
  allowAttrs?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
  sanitize: true,
  allowTags: () => [],
  allowAttrs: () => [],
})

const renderedHtml = computed(() => {
  const raw = props.html ?? ''

  if (!props.sanitize) return raw

  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_TAGS: props.allowTags,
    ADD_ATTR: [
      'style',
      'class',
      'target',
      'rel',
      'title',
      'border',
      'cellpadding',
      'cellspacing',
      'width',
      'height',
      'src',
      'alt',
      'href',
      ...props.allowAttrs,
    ],
    FORBID_TAGS: ['script'],
  })
})
</script>

<template>
  <div class="richtext text-base text-neutral-basic leading-relaxed break-words" v-html="renderedHtml" />
</template>

<style lang="scss" scoped>
.richtext {
  line-height: 1.6;

  :deep {

    /* 基本文字結構 */
    p {
      margin: 0.6em 0;
    }

    strong,
    b {
      font-weight: 700;
    }

    em,
    i {
      font-style: italic;
    }

    u {
      text-decoration: underline;
    }

    s,
    del {
      text-decoration: line-through;
    }

    /* 連結 */
    a {
      color: var(--color-primary-normal);
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary-normal);
      }

      &:visited {
        color: var(--color-primary-50);
      }
    }

    /* 清單 */
    ul,
    ol {
      padding-left: 1.25em;
      margin: 0.6em 0;
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    li {
      margin: 0.25em 0;
    }

    /* 分隔線 */
    hr {
      border: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      margin: 1em 0;
    }

    /* 圖片 */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0.8em 0;
    }

    /* 表格（手機可橫滑） */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8em 0;
    }

    th,
    td {
      border: 1px solid rgba(0, 0, 0, 0.12);
      padding: 0.5em;
      vertical-align: top;
      text-align: left;
    }

    thead th {
      font-weight: 600;
      background-color: rgba(0, 0, 0, 0.03);
    }

    /* 程式碼 */
    pre {
      background: #f8f8f8;
      padding: 0.75em;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.875em;
      line-height: 1.5;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      background: rgba(0, 0, 0, 0.05);
      padding: 0.1em 0.3em;
      border-radius: 3px;
      font-size: 0.875em;
    }

    pre code {
      background: none;
      padding: 0;
    }

    /* 引用 */
    blockquote {
      margin: 0.8em 0;
      padding-left: 1em;
      border-left: 4px solid rgba(0, 0, 0, 0.15);
      color: rgba(0, 0, 0, 0.65);
    }

    /* iframe */
    iframe {
      max-width: 100%;
      border: 0;
    }
  }
}
</style>
