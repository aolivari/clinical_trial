import { render, screen, fireEvent } from "@testing-library/react";
import { Alert } from "../Alert";

describe("Alert Component", () => {
  it("renders error message and default title/icon correctly", () => {
    render(<Alert message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument(); // material symbol icon name
  });

  it("renders with custom title and type styles", () => {
    const { rerender } = render(
      <Alert message="Informational alert" title="System Info" type="info" />
    );
    expect(screen.getByText("System Info")).toBeInTheDocument();
    expect(screen.getByText("info")).toBeInTheDocument();
    expect(screen.getByTestId("alert-container")).toHaveClass("bg-blue-50", "text-blue-800");

    rerender(<Alert message="Success message" type="success" />);
    expect(screen.getByText("check_circle")).toBeInTheDocument();
    expect(screen.getByTestId("alert-container")).toHaveClass("bg-emerald-50");
  });

  it("calls onRetry callback when retry button is clicked", () => {
    const handleRetry = jest.fn();
    render(<Alert message="Fatal error" onRetry={handleRetry} retryText="Try Again" />);

    const retryBtn = screen.getByRole("button", { name: "Try Again" });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
