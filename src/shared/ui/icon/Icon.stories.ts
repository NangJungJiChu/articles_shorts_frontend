import type { Meta, StoryObj } from '@storybook/vue3'
import { Icon } from './index'

const meta: Meta<typeof Icon> = {
  title: 'Shared/UI/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'Material Symbol name' },
    type: { control: 'select', options: ['filled', 'outlined'] },
  },
  args: {
    name: 'favorite',
    type: 'outlined',
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {},
}

export const Filled: Story = {
  args: {
    type: 'filled',
  },
}

export const Search: Story = {
  args: {
    name: 'search',
  },
}

export const SettingsFilled: Story = {
  args: {
    name: 'settings',
    type: 'filled',
  },
}
