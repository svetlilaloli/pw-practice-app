import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options'

require('dotenv').config();

export default defineConfig<TestOptions>({
  timeout: 40000, // overwriting the default test timeout of 30000ms
  globalTimeout: 60000, // the whole test run, default is 'no timeout'
  expect: { // overwriting the default expect timeout of 5000ms
    timeout: 2000
  },
  retries: 1,
  reporter: 'html',
  use: { // run-time
    baseURL: process.env.DEV === '1' ? 'http://localhost:4201'
      : process.env.STAGING === '1' ? 'http://localhost:4202'
        : 'http://localhost:4200',
    globalsQaUrl: 'https://www.globalsqa.com/demo-site/draganddrop/',
    trace: 'on-first-retry',
    actionTimeout: 20000, // default is 'no timeout'
    navigationTimeout: 25000, // default is 'no timeout'
    video: { // for video recording the test should be run from the CLI
      mode: 'off',
      size: { width: 1920, height: 1200 } // full HD
    },
  },

  projects: [
    {
      name: 'dev', // creating different environments
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200',
      }
    },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: {
        viewport: { width: 1920, height: 1200 }
      }
    },
    {
      name: 'chromium',
      fullyParallel: true // only for this project
    },

    {
      name: 'firefox',
      use: {
        browserName: 'firefox'
      },
    }
  ]
});
