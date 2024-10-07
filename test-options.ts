import { test as base } from '@playwright/test'
import { PageManager } from './page-objects/pageManager';

export type TestOptions = {
    globalsQaUrl: string,
    formLayoutsPage: string,
    pageManager: PageManager
}
// creating fixture, tests are faster when using fixtures
export const test = base.extend<TestOptions>({
    globalsQaUrl: ['', { option: true }],
    
    formLayoutsPage: async ({ page }, use) => {
        await page.goto('/')
        await page.getByText('Forms').click()
        await page.getByText('Form Layouts').click()
        await use('') // the lines before 'use' are executed before the test, the lines after 'use' are executed after the test
        console.log('Tear down') // 
    },

    pageManager: async ({ page, formLayoutsPage }, use) => { // passing 'formLayoutsPage' as dependency
        const pm = new PageManager(page)
        await use(pm)
    }
})