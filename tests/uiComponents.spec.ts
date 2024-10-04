import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel'}) // to run all tests in the file in parallel

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test.describe('Form Layouts page', () => {
    test.describe.configure({ retries: 2 }) // configure retries for specific tests
    test.describe.configure({ mode: 'serial'}) // to run the tests in this section sequentially

    test.beforeEach(async ({ page }) => {
        await page.getByText('Forms').click()
        await page.getByText('Form Layouts').click()
    })

    test('input fields', async ({ page }, testInfo) => {
        if (testInfo.retry){
            // do something
        }
        const usingTheGridEmailInput = page.locator('nb-card', { hasText: 'Using the Grid' }).getByRole('textbox', { name: 'Email' })

        await usingTheGridEmailInput.fill('test@test.com')
        await usingTheGridEmailInput.clear()
        await usingTheGridEmailInput.pressSequentially('test2@test.com', { delay: 500 }) // to simulate keyboard keystrokes

        // generic assertion
        const inputValue = await usingTheGridEmailInput.inputValue()
        expect(inputValue).toEqual('test2@test.com')

        // locator assertion
        await expect(usingTheGridEmailInput).toHaveValue('test2@test.com')
    })

    test('radio buttons', async ({ page }) => {
        const usingTheGridForm = page.locator('nb-card', { hasText: 'Using the Grid' })

        // // 1. way
        // await usingTheGridForm.getByLabel('Option 1').check({ force: true })
        // // 2. way - recommended
        await usingTheGridForm.getByRole('radio', { name: 'Option 1' }).check({ force: true })

        // generic assertion
        const radioStatus = await usingTheGridForm.getByRole('radio', { name: 'Option 1' }).isChecked()
        expect(radioStatus).toBeTruthy()

        // locator assertion
        await expect(usingTheGridForm.getByRole('radio', { name: 'Option 1' })).toBeChecked()

        // after selecting the second radio button, check if the first one is not checked
        await usingTheGridForm.getByRole('radio', { name: 'Option 2' }).check({ force: true })
        expect(await usingTheGridForm.getByRole('radio', { name: 'Option 1' }).isChecked()).toBeFalsy()
        expect(await usingTheGridForm.getByRole('radio', { name: 'Option 2' }).isChecked()).toBeTruthy()
    })
})

test('check boxes', async ({ page }) => {
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Toastr').click()

    // check() and uncheck() check the status of the checkbox, if 'true' it won't reverse it like click()
    await page.getByRole('checkbox', { name: 'Hide on click' }).uncheck({ force: true })
    await page.getByRole('checkbox', { name: 'Prevent arising of duplicate toast' }).check({ force: true })

    const allBoxes = page.getByRole('checkbox')
    for (const box of await allBoxes.all()) { // for-of to loop through an array
        await box.uncheck({ force: true })
        expect(await box.isChecked()).toBeFalsy()
    }
})

test('lists and dropdowns', async ({ page }) => {
    const dropDownMenu = page.locator('ngx-header nb-select')
    await dropDownMenu.click()

    // page.getByRole('list') // when the list has a UL tag
    // page.getByRole('listitem') // when the list has a LI tag
    const optionList = page.locator('nb-option-list nb-option')
    await expect(optionList).toHaveText(['Light', 'Dark', 'Cosmic', 'Corporate'])
    await optionList.filter({ hasText: 'Cosmic' }).click()
    const header = page.locator('nb-layout-header')
    await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)')

    const colors = {
        'Light': 'rgb(255, 255, 255)',
        'Dark': 'rgb(34, 43, 69)',
        'Cosmic': 'rgb(50, 50, 89)',
        'Corporate': 'rgb(255, 255, 255)',
    }

    await dropDownMenu.click()
    for (const color in colors) { // for-in to loop through an object
        await optionList.filter({ hasText: color }).click()
        await expect(header).toHaveCSS('background-color', colors[color])
        if (color != 'Corporate')
            await dropDownMenu.click()
    }
})

test('tooltips', async ({ page }) => {
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Tooltip').click()

    const tooltipCard = page.locator('nb-card', { hasText: 'Tooltip Placements' })
    await tooltipCard.getByRole('button', { name: 'Top' }).hover()

    // page.getByRole('tooltip') - if you have a role tooltip created on the page this would work
    const tooltip = await page.locator('nb-tooltip').textContent()
    expect(tooltip).toEqual('This is a tooltip')
})
// browser messages (dialog boxes)
test('dialog box', async ({ page }) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    page.on('dialog', dialog => {
        expect(dialog.message()).toEqual('Are you sure you want to delete?')
        dialog.accept()
    })

    await page.getByRole('table').locator('tr', { hasText: 'mdo@gmail.com' }).locator('.nb-trash').click()
    await expect(page.locator('table tr').first()).not.toHaveText('mdo@gmail.com')
})

test('web tables', async ({ page }) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    // 1. Get the row by any text on that row
    const targetRow = page.getByRole('row', { name: 'twitter@outlook.com' })
    await targetRow.locator('.nb-edit').click()

    const ageField = page.locator('input-editor').getByPlaceholder('Age')
    await ageField.clear()
    await ageField.fill('35')
    await page.locator('.nb-checkmark').click()

    // 2. Get the row by the value of a specific column
    page.locator('.ng2-smart-pagination-nav').getByText('2').click()
    const targetRowById = page.getByRole('row', { name: '11' }).filter({ has: page.locator('td').nth(1).getByText('11') })
    await targetRowById.locator('.nb-edit').click()

    const emailField = page.locator('input-editor').getByPlaceholder('E-mail')
    await emailField.clear()
    await emailField.fill('test@test.com')
    await page.locator('.nb-checkmark').click()
    await expect(targetRowById.locator('td').nth(5)).toHaveText('test@test.com')

    // 3. Filter the table
    const ages = ['20', '30', '40', '200']

    for (let age of ages) {
        const ageField = page.locator('input-filter').getByPlaceholder('Age')
        await ageField.clear()
        await ageField.fill(age)

        await page.waitForTimeout(500) // filtering the table is slower than test

        const rows = page.locator('tbody tr')

        for (let row of await rows.all()) {
            const cellValue = await row.locator('td').last().textContent()

            if (age != '200') {
                expect(cellValue).toEqual(age)
            } else {
                expect(cellValue).toEqual(' No data found ')
                // expect(await page.getByRole('table').textContent()).toContain('No data found') // also works
            }
        }
    }
})

test('datepicker', async ({ page }) => {
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()

    const calendarInputField = page.getByPlaceholder('Form Picker')
    await calendarInputField.click()

    let date = new Date()
    date.setDate(date.getDate() + 13)
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('En-US', { month: 'short' })
    const expectedMonthLong = date.toLocaleString('En-US', { month: 'long' })
    const expectedYearFull = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYearFull}`

    let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYearFull}`

    while (!calendarMonthAndYear.includes(expectedMonthAndYear)) {
        await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
        calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    }

    await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, { exact: true }).click() // without the option 'exact' it will return all partial matches
    await expect(calendarInputField).toHaveValue(dateToAssert)
})

test('sliders', async ({ page }) => {
    // // update attribute
    // const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    // await tempGauge.evaluate(node => {
    //     node.setAttribute('cx', '232.63')
    //     node.setAttribute('cy', '232.63')
    // })
    // await tempGauge.click()

    // mouse move
    const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await tempBox.scrollIntoViewIfNeeded() // to make sure the box in in the visible area

    const box = await tempBox.boundingBox() // create x,y coordinates for tempBox; (0, 0) is top left corner
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y) // position the cursor in the centre of the box
    await page.mouse.down() // press left mouse button
    await page.mouse.move(x + 100, y)
    await page.mouse.move(x + 100, y + 100)
    await page.mouse.up()
    await expect(tempBox).toContainText('30')
})