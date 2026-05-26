import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "../Select";

describe("Select Component", () => {
  const mockOptions = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
  ];

  it("renders select label and option elements correctly", () => {
    const handleChange = jest.fn();
    render(
      <Select
        id="test-select"
        label="Test Select"
        value="opt1"
        onChange={handleChange}
        options={mockOptions}
      />
    );

    expect(screen.getByText("Test Select")).toBeInTheDocument();
    
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();
    expect(selectElement.value).toBe("opt1");

    expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option 2" })).toBeInTheDocument();

    fireEvent.change(selectElement, { target: { value: "opt2" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("displays required asterisks and helperText when provided", () => {
    render(
      <Select
        id="req-select"
        label="Required dropdown"
        required
        helperText="Required instructions"
        options={mockOptions}
      />
    );

    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Required instructions")).toBeInTheDocument();
  });

  it("displays error messages and styles correctly", () => {
    render(
      <Select
        id="err-select"
        label="Error dropdown"
        error="Please select an option"
        options={mockOptions}
      />
    );

    expect(screen.getByText("Please select an option")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("border-error");
  });

  it("supports JSX options as children override", () => {
    render(
      <Select id="child-select" options={[]}>
        <option value="child1">Child 1</option>
        <option value="child2">Child 2</option>
      </Select>
    );

    expect(screen.getByRole("option", { name: "Child 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Child 2" })).toBeInTheDocument();
  });
});
