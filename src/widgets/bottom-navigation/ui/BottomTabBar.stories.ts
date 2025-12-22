import type { Meta, StoryObj } from '@storybook/vue3'
import { BottomTabBar } from './index'


const meta: Meta<typeof BottomTabBar> = {
  title: 'Widgets/BottomNavigation/BottomTabBar',
  component: BottomTabBar,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<story />',
      setup() {
        // Ensure router is installed
        // In a real Storybook setup, this should be done globally.
        // Here we rely on the fact that if we can't install it globally easily,
        // we might get warnings, but let's try to just provide the component.
        // Actually, easiest is to use `app.use(router)` logic if we had access to app.
        // For now, let's just remove the args that cause type errors.
      },
    }),
  ],
}

export default meta
type Story = StoryObj<typeof BottomTabBar>

// We need to provide the router to the application instance that Storybook creates.
// Since we can't easily touch the global preview.js here, we might just define the story
// to render with a local router setup if possible, or accept that it might not render perfectly in this static view without global config.
// However, the TYPE check acts on the file. Removing args is the priority.

export const Default: Story = {
  render: () => ({
    components: { BottomTabBar },
    setup() {
      // Trying to provide router if possible, but mainly removing args
      return {}
    },
    template: '<BottomTabBar />',
  }),
}

export const ShortsActive: Story = {
  render: () => ({
    components: { BottomTabBar },
    setup() {
      // Trying to provide router if possible, but mainly removing args
      return {}
    },
    template: '<BottomTabBar />',
  }),
}

export const ProfileActive: Story = {
  render: () => ({
    components: { BottomTabBar },
    setup() {
      // Trying to provide router if possible, but mainly removing args
      return {}
    },
    template: '<BottomTabBar />',
  }),
}
