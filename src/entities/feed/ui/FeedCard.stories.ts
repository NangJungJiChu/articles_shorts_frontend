import type { Meta, StoryObj } from '@storybook/vue3'
import { FeedCard } from './index'

const meta: Meta<typeof FeedCard> = {
  title: 'Entities/Feed/FeedCard',
  component: FeedCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    likesCount: { control: 'number' },
    commentsCount: { control: 'number' },
  },
  args: {
    title: '제목',
    content: '게시글 콘텐츠 123',
    likesCount: 8000,
    commentsCount: 8000,
  },
}

export default meta
type Story = StoryObj<typeof FeedCard>

export const Default: Story = {
  args: {},
}

export const WithMarkdownImage: Story = {
  args: {
    content:
      'This post includes an image.\n\n![Placeholder](https://via.placeholder.com/600x300)\n\nAnd some text below it.',
  },
}

export const LongContentWithBreaks: Story = {
  args: {
    content:
      'First line.\nSecond line (should be on new line).\n\nThird paragraph after empty line.',
  },
}
