import type { Meta, StoryObj } from '@storybook/vue3'
import { ShortsCard } from './index'

const meta: Meta<typeof ShortsCard> = {
  title: 'Entities/Shorts/ShortsCard',
  component: ShortsCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
  },
  args: {
    title: 'Shorts Title',
    content: 'Short content here.',
  },
  parameters: {
    layout: 'fullscreen', // Important for 100dvh component
  },
}

export default meta
type Story = StoryObj<typeof ShortsCard>

export const Default: Story = {
  args: {
    content: 'Short content that does not overflow.',
  },
}

export const OverflowingContent: Story = {
  args: {
    content: `
# Expanding Content
This is a long content that should trigger the "Tap to expand" overlay.

${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50)}

![Placeholder](https://via.placeholder.com/600x400)

${'More text here to ensure overflow. '.repeat(50)}
    `,
  },
}
