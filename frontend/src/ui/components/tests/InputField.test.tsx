import { render, screen, fireEvent } from "@testing-library/react";
import { InputField } from "../InputField";

describe("InputField Component", () => {
  it("renders label, placeholder, and binds value correctly", () => {
    const handleChange = jest.fn();
    render(
      <InputField
        id="test-input"
        label="Test Input"
        placeholder="Enter name"
        value="Antigravity"
        onChange={handleChange}
      />
    );

    const labelElement = screen.getByText("Test Input");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute("for", "test-input");

    const inputElement = screen.getByPlaceholderText("Enter name") as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.value).toBe("Antigravity");

    fireEvent.change(inputElement, { target: { value: "New Val" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("displays required asterisks and helperText when provided", () => {
    render(
      <InputField
        id="req-input"
        label="Required Field"
        required
        helperText="Required instructions"
      />
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Required instructions")).toBeInTheDocument();
  });

  it("displays error messages and styles correctly", () => {
    render(
      <InputField
        id="err-input"
        label="Error Field"
        error="Invalid format"
      />
    );

    expect(screen.getByText("Invalid format")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-error");
  });
});
