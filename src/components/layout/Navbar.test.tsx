import { render, screen } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";

import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders public navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText(/explore/i)).toBeInTheDocument();

    expect(screen.getByText(/login/i)).toBeInTheDocument();

    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });
});
