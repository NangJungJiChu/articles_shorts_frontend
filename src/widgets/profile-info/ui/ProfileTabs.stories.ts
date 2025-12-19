import type { Meta, StoryObj } from '@storybook/vue3'
import { ProfileTabs } from './index'

const meta: Meta<typeof ProfileTabs> = {
  title: 'Widgets/ProfileInfo/ProfileTabs',
  component: ProfileTabs,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'radio', options: ['likes', 'posts'] },
  },
  args: {
    modelValue: 'likes',
  },
}

export default meta
type Story = StoryObj<typeof ProfileTabs>

export const Default: Story = {
  render: (args) => ({
    components: { ProfileTabs },
    setup() {
      return { args }
    },
    template: '<ProfileTabs v-model="args.modelValue" />',
  }),
}

export const PostsActive: Story = {
  args: {
    modelValue: 'posts',
  },
}
