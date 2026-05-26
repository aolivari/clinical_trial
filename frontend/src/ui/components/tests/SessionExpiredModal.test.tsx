import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionExpiredModal } from "../SessionExpiredModal";

describe("SessionExpiredModal Component", () => {
  const mockOnRelogin = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    email: "test@example.com",
    onRelogin: mockOnRelogin,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with email and locks password input", () => {
    render(<SessionExpiredModal {...defaultProps} />);

    expect(screen.getByText("Your session has expired")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resume Session/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument();
  });

  it("triggers onCancel when Sign out button is clicked", async () => {
    const user = userEvent.setup();
    render(<SessionExpiredModal {...defaultProps} />);

    const signOutBtn = screen.getByRole("button", { name: /Sign out/i });
    await user.click(signOutBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("handles successful relogin", async () => {
    const user = userEvent.setup();
    mockOnRelogin.mockResolvedValueOnce(undefined);

    render(<SessionExpiredModal {...defaultProps} />);

    const passwordInput = screen.getByLabelText(/Password/i);
    await user.type(passwordInput, "correct-password");

    const submitBtn = screen.getByRole("button", { name: /Resume Session/i });
    await user.click(submitBtn);

    expect(mockOnRelogin).toHaveBeenCalledWith("correct-password");
  });

  it("shows error message when relogin fails", async () => {
    const user = userEvent.setup();
    mockOnRelogin.mockRejectedValueOnce(new Error("Incorrect password"));

    render(<SessionExpiredModal {...defaultProps} />);

    const passwordInput = screen.getByLabelText(/Password/i);
    await user.type(passwordInput, "wrong-password");

    const submitBtn = screen.getByRole("button", { name: /Resume Session/i });
    await user.click(submitBtn);

    expect(mockOnRelogin).toHaveBeenCalledWith("wrong-password");
    
    expect(
      await screen.findByText("Password incorrect please try again.")
    ).toBeInTheDocument();
  });
});
