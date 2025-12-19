import type { Meta, StoryObj } from '@storybook/vue3';
import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'Shared/UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    default: { control: 'text', description: 'Slot content' },
  },
  args: {
    default: 'Button',
    variant: 'primary',
    size: 'medium',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;
type StoryArgs = Story['args'];

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};

export const Small: Story = {
  args: {
    size: 'small',
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};

export const Medium: Story = {
  args: {
    size: 'medium',
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};

export const Large: Story = {
  args: {
    size: 'large',
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args: StoryArgs) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">{{ args.default }}</Button>',
  }),
};
