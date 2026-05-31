import {
  test,
  expect,
} from "@playwright/test"

test(
  "homepage loads correctly",
  async ({
    page,
  }) => {
    await page.goto("/")

    await expect(
      page
    ).toHaveTitle(
      /chatter/i
    )

    await expect(
  page.getByRole(
    "link",
    {
      name: "Explore",
      exact: true,
    }
  )
).toBeVisible()
  }
)

test(
  "navigate to login page",
  async ({
    page,
  }) => {
    await page.goto("/")

    await page
      .getByText(/login/i)
      .click()

    await expect(
      page
    ).toHaveURL(
      /login/
    )
  }
)