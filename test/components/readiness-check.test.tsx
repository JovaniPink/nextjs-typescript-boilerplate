import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReadinessCheck } from "@/components/readiness-check";

describe("ReadinessCheck", () => {
  it("makes the client interaction observable", async () => {
    const user = userEvent.setup();

    render(<ReadinessCheck />);
    await user.click(screen.getByRole("button", { name: /verify the interaction/i }));

    expect(screen.getByRole("button", { name: /baseline verified/i })).toBeDisabled();
    expect(screen.getByText(/client behavior is wired and observable/i)).toBeVisible();
  });
});
