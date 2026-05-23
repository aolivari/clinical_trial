import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "../ui/LoginPage";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate-component">{to}</div>
  ),
}));

// Mock AuthContext
jest.mock("../../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LoginPage Component", () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("redirects to /dashboard if already authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
    });

    render(<LoginPage />);
    expect(screen.getByTestId("navigate-component")).toHaveTextContent(
      "/dashboard",
    );
  });

  it("renders login view and handles successful login", async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
    });
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    // Click the submit button
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith(
      "researcher@clintrack.com",
      "password123",
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("displays an error message if login fails", async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
    });
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
