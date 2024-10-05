import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(process.env.URL)
    await page.getByText('Button Triggering AJAX Request').click()
    // testInfo.setTimeout(testInfo.timeout + 2000) // setting timeout for the whole test suite
})

test('auto waiting', async ({ page }) => {
    const successButton = page.locator('.bg-success')
    // // method with auto wait
    // await successButton.click()
    // const text = await successButton.textContent()

    // // method without auto wait
    // await successButton.waitFor({state: "attached"})
    // const text = await successButton.allTextContents()
    // expect(text).toContain('Data loaded with AJAX get request.')


    // overwriting timeout; 'expect' default timeout is 5000ms
    await expect(successButton).toHaveText('Data loaded with AJAX get request.', { timeout: 20000 })
})

test('alternative waits', async ({ page }) => {
    const successButton = page.locator('.bg-success')
    // // 1. wait for element
    // await page.waitForSelector('.bg-success')

    // // 2. wait for particular response
    // await page.waitForResponse('http://uitestingplayground.com/ajaxdata')

    // 3. wait for network calls to be compleated (NOT RECOMMENDED)
    await page.waitForLoadState('networkidle')

    const text = await successButton.allTextContents()
    expect(text).toContain('Data loaded with AJAX get request.')
})

test('timeouts', async ({ page }) => {
    test.setTimeout(10000) // overwriting the default timeout of 30000ms
    test.slow() // will increese the default timeout x3
    const successButton = page.locator('.bg-success')

    await successButton.click({ timeout: 16000 }) // should fail as exceeds the test timeout set above
})