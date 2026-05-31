import {
  render,
  screen,
} from "@testing-library/react"

import Footer from "./Footer"

describe(
  "Footer",
  () => {
    it(
      "renders footer text",
      () => {
        render(<Footer />)

        expect(
          screen.getByText(
            /chatter/i
          )
        ).toBeInTheDocument()
      }
    )
  }
)