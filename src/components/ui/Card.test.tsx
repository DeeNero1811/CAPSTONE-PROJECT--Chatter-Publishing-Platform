import { render, screen } from "@testing-library/react";

import Card from "./Card";

describe("Card", () => {
  it("renders children correctly", () => {
    render(<Card>Hello Test</Card>);

    expect(screen.getByText("Hello Test")).toBeInTheDocument();
  });

  it("applies card styling", () => {
    const { container } = render(<Card>Styled Card</Card>);

    const card = container.firstChild;

    expect(card).toHaveClass("rounded-3xl");
  });
});
