import type { Preview } from '@storybook/vue3'
import '../src/shared/ui/tokens/colors.css';
import '../src/shared/ui/tokens/typography.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
