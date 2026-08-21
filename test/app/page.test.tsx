import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home", () => {
  it("presents the starter baseline and primary paths", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /start with the quality bar already in place/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /health endpoint/i })).toHaveAttribute(
      "href",
      "/api/health",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
