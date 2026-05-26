import { render, screen } from "@testing-library/react";
import { Tag } from "../Tag";

describe("Tag Component", () => {
  it("renders text content correctly", () => {
    render(<Tag color="blue">Active</Tag>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies the correct classes based on the color prop", () => {
    const { rerender } = render(<Tag color="blue">Active</Tag>);
    expect(screen.getByText("Active")).toHaveClass("bg-blue-50", "text-blue-800", "border-blue-200");

    rerender(<Tag color="red">Withdrawn</Tag>);
    expect(screen.getByText("Withdrawn")).toHaveClass("bg-red-50", "text-red-800", "border-red-200");

    rerender(<Tag color="purple">Completed</Tag>);
    expect(screen.getByText("Completed")).toHaveClass("bg-purple-50", "text-purple-800", "border-purple-200");
  });

  it("uses the rounded variant by default", () => {
    render(<Tag color="blue">Active</Tag>);
    expect(screen.getByText("Active")).toHaveClass("rounded", "text-[10px]");
  });

  it("applies pill variant classes when specified", () => {
    render(<Tag color="blue" variant="pill">Active</Tag>);
    expect(screen.getByText("Active")).toHaveClass("rounded-full", "text-[9px]");
  });

  it("applies custom external class names", () => {
    render(<Tag color="blue" className="custom-class">Active</Tag>);
    expect(screen.getByText("Active")).toHaveClass("custom-class");
  });
});
