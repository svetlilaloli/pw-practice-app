import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import { faker } from '@faker-js/faker'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('navigate to form page', async ({ page }) => {
	const pm = new PageManager(page)
    await pm.navigateTo().formLayoutsPage()
    await pm.navigateTo().datepickerPage()
    await pm.navigateTo().smartTablePage()
    await pm.navigateTo().toastrPage()
    await pm.navigateTo().tooltipPage()
})

test('parameterised methods', async ({ page }) => {
	const pm = new PageManager(page)
	const randomFullName = faker.person.fullName()
	const randomEmail = `${randomFullName.replace(' ', '')}${faker.number.int(1000)}@test.com`

	await pm.navigateTo().formLayoutsPage()
	await pm.onFormLayoutsPage().submitUsingTheGridFormWithCredentialsAndSelectOption('test@test.com', 'Welcome1', 'Option 1')
	// screenshot of the whole page
	await page.screenshot({ path: 'screenshots/formsLayoutsPage.png'})
	// save as binary
	const binary = await page.screenshot()
	// console.log(binary.toString('base64'))

	await pm.onFormLayoutsPage().submitInlineFormWithNameEmailAndCheckbox(randomFullName, randomEmail, true)
	// screenshot of the section only
	await page.locator('nb-card', { hasText: 'Inline form'}).screenshot({ path: 'screenshots/inlineForm.png'})

	await pm.navigateTo().datepickerPage()
	await pm.onDatepickerPage().selectCommonDatepickerDateFromToday(13)
	await pm.onDatepickerPage().selectDatepickerWithRangeFromToday(8, 10)
})