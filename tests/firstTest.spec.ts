import { test, expect } from '@playwright/test';

// playwright fixtures: browser, page, ...
// playwright hooks: beforeEach, afterEach, beforeAll, afterAll. Not a good practise to use after hooks, tests may become flaky
// beforeAll hook example - connecting to DB

test.beforeEach(async ({page}) => {
    await page.goto('/')
    await page.getByText('Forms').click()
    await page.getByText('Form Layouts').click()
})

test('Locator syntax rules', async ({page}) => {
    // by Tag name
    // page.locator(selector, options)
    // try to avoid using first(), last() as order of elements may change
    await page.locator('input').first().click()

    // by ID
    page.locator('#inputEmail1')

    // by Class value
    page.locator('.shape-rectangle')

    // by Class full value
    page.locator('[class="input-full-width size-medium status-basic shape-rectangle nb-transition"]')

    // by Attribute
    page.locator('[placeholder="Email"]')

    // combine different selectors (no spaces)
    page.locator('input[placeholder="Email"][nbinput].shape-rectangle')

    // by XPath (NOT RECOMENDED)
    page.locator('//*[@id="inputEmail1"]')

    // by partial text
    page.locator(':text("Using")')

    // by exact text
    page.locator(':text-is("Using the Grid")')
})

// Best Practice is to use 'User facing locators'
test('user facing locators', async({page}) => {
    // ARIA role
    // page.getByRole(role, options)
    await page.getByRole('textbox', {name: "Email"}).first().click()
    await page.getByRole('button', {name: "Sign in"}).first().click()

    // by Label
    await page.getByLabel('Email').first().click() // it will click on the input with label 'Email'

    // by placeholder
    await page.getByPlaceholder('Jane Doe').click()

    // by text
    await page.getByText('Using the Grid').click()

    // by test id (added 'data-testid="SignIn"' attribute to the 'Sign in' button, 'data-testid' is a playwright attribute)
    await page.getByTestId('SignIn').click()

    // by title
    await page.getByTitle('IoT Dashboard').click()
})

test('locating child elements', async({page}) => {
    // elements are separated by space; it doesn't have to be direct child
    await page.locator('nb-card nb-radio :text-is("Option 1")').click()
    // chaining
    await page.locator('nb-card').locator('nb-radio').locator(':text-is("Option 2")').click()

    // combining 'locator' and 'user facing element'
    await page.locator('nb-card').first().getByRole('button', {name: "Submit"}).click()
    
    // by index, zero-based indexes
    // try to avoid this as order of elements may change
    await page.locator('nb-card').nth(0).getByRole('button').click()
})

test('locating parent elements', async({page}) => {
    await page.locator('nb-card', { hasText: "Using the Grid"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator('nb-card', { has: page.locator('#inputEmail1')}).getByRole('textbox', {name: "Email"}).click()

    await page.locator('nb-card').filter({ hasText: "Basic form"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator('nb-card').filter({ has: page.locator('.status-danger')}).getByRole('textbox', {name: "Email"}).click()

    await page.locator('nb-card').filter({has: page.locator('nb-checkbox')}).filter({hasText: "Sign in"}).getByRole('textbox', {name: "Email"}).click()

    // not recommended, X-Path '..' - go one level up
    await page.locator(':text-is("Using the Grid")').locator('..').getByRole('textbox', {name: "Email"}).click()
})

test('reusing locators', async({page}) => {
    const basicForm = page.locator('nb-card').filter({ hasText: "Basic form"})
    const emailField = basicForm.getByRole('textbox', {name: "Email"})

    await emailField.fill('test@test.com')
    await basicForm.getByRole('textbox', {name: "Password"}).fill('Welcome123')
    await basicForm.locator('nb-checkbox').click()
    await basicForm.getByRole('button', {name: "Submit"}).click()

    await expect(emailField).toHaveValue('test@test.com')
})

test('extracting values', async({page}) => {
    // single text value
    const basicForm = page.locator('nb-card').filter({ hasText: "Basic form"})
    const buttonText = await basicForm.locator('button').textContent()
    expect(buttonText).toEqual('Submit')

    // all text values
    const allRadioButtonsText = await page.locator('nb-radio').allTextContents()
    expect(allRadioButtonsText).toContain('Option 1')

    // input value
    const email = 'test@test.com'
    const emailField = basicForm.getByRole('textbox', {name: "Email"})
    await emailField.fill(email)
    const emailValue = await emailField.inputValue()
    expect(emailValue).toEqual(email)

    // placeholder value
    const placeholderValue = await emailField.getAttribute('placeholder')
    expect(placeholderValue).toEqual('Email')
})

test('assertions', async({page}) => {
    const basicFormButton = page.locator('nb-card').filter({ hasText: "Basic form"}).locator('button')
    
    // generic assertions
    const value = 5
    expect(value).toEqual(5)

    const buttonText = await basicFormButton.textContent()
    expect(buttonText).toEqual('Submit')

    // locator assertions, waits 5 sec to find the element
    await expect(basicFormButton).toHaveText('Submit')

    // soft assertion (not good practice) - if the assertion fails, the test will continue
    await expect.soft(basicFormButton).toHaveText('Submit')
    await basicFormButton.click()
})