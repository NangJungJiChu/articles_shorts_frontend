/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
import path from 'node:path'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
import fs from 'node:fs'
import glob from 'fast-glob'

const materialSymbolsPlugin = () => {
    return {
        name: 'vite-plugin-material-symbols',
        transformIndexHtml(html: string) {
            const files = glob.sync('src/**/*.vue')
            const icons = new Set<string>()

            files.forEach((file: string) => {
                const content = fs.readFileSync(file, 'utf-8')
                // Match name="icon_name" or :name="'icon_name'"
                const matches = content.matchAll(/Icon\s+[^>]*?name=(?:"([^"]+)"|'([^']+)'|:name=(?:"([^"]+)"|'([^']+)'|`([^`]+)`))/g)
                for (const match of matches) {
                    const iconName = match[1] || match[2] || match[4] || match[5]
                    if (iconName && !iconName.startsWith('$')) {
                        // Very simple check to exclude dynamic variables if possible,
                        // though we'll likely catch some extra strings here.
                        icons.add(iconName)
                    }
                }
            })

            if (icons.size === 0) return html

            const iconNames = Array.from(icons).sort().join(',')
            const linkTag = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${iconNames}&display=block" />`

            return html.replace(/<\/head>/, `  ${linkTag}\n</head>`)
        }
    }
}

const isStorybookProcess = process.env.npm_lifecycle_event === 'storybook'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    !isStorybookProcess && vueDevTools(),
    materialSymbolsPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
