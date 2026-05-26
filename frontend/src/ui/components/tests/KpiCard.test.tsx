import { render, screen } from "@testing-library/react";
import { KpiCard } from "../KpiCard";

describe("KpiCard Component", () => {
  it("renders title, icon, and value correctly", () => {
    render(<KpiCard title="Total Enrolled" iconName="groups" value={13} />);

    expect(screen.getByText("Total Enrolled")).toBeInTheDocument();
    expect(screen.getByText("groups")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("applies the custom icon color class", () => {
    render(<KpiCard title="Total Enrolled" iconName="groups" iconColorClass="text-emerald-600" value={13} />);
    expect(screen.getByText("groups")).toHaveClass("text-emerald-600");
  });

  it("shows loading placeholder when isLoading is true", () => {
    render(<KpiCard title="Total Enrolled" iconName="groups" value={13} isLoading={true} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("13")).not.toBeInTheDocument();
  });

  it("renders children elements when provided", () => {
    render(
      <KpiCard title="Total Enrolled" iconName="groups" value={13}>
        <div data-testid="child-element">Active subjects</div>
      </KpiCard>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Active subjects")).toBeInTheDocument();
  });
});
