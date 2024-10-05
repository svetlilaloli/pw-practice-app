import { test as base } from '@playwright/test'

export type TestOptions = {
    globalsQaUrl: string
}

export const test = base.extend<TestOptions>({
    globalsQaUrl: ['', { option: true }]
})