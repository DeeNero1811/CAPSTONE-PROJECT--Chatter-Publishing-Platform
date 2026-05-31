import {
  calculateReadingTime,
} from "./readingTime"

describe(
  "calculateReadingTime",
  () => {
    it(
      "calculates reading time correctly",
      () => {
        const text =
          "word ".repeat(400)

        expect(
          calculateReadingTime(
            text
          )
        ).toBe(
          "2 min read"
        )
      }
    )

    it(
      "returns 1 minute for short content",
      () => {
        expect(
          calculateReadingTime(
            "hello world"
          )
        ).toBe(
          "1 min read"
        )
      }
    )
  }
)