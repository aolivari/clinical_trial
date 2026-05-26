import { render, screen } from "@testing-library/react";
import { GenericTable, Column } from "../GenericTable";

interface DummyData {
  id: string;
  name: string;
  role: string;
}

const columns: Column<DummyData>[] = [
  {
    key: "name",
    header: "Full Name",
    headerClassName: "custom-header-class",
    cellClassName: "custom-cell-class",
  },
  {
    key: "role",
    header: "Job Role",
    render: (item) => <span data-testid="role-badge">{item.role.toUpperCase()}</span>,
  },
];

const mockData: DummyData[] = [
  { id: "1", name: "Alice Smith", role: "Researcher" },
  { id: "2", name: "Bob Johnson", role: "Clinician" },
];

describe("GenericTable Component", () => {
  it("renders headers and cells correctly", () => {
    render(
      <GenericTable
        data={mockData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Job Role")).toBeInTheDocument();
    expect(screen.getByText("Full Name")).toHaveClass("custom-header-class");

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toHaveClass("custom-cell-class");
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();

    const roles = screen.getAllByTestId("role-badge");
    expect(roles.length).toBe(2);
    expect(roles[0]).toHaveTextContent("RESEARCHER");
    expect(roles[1]).toHaveTextContent("CLINICIAN");
  });

  it("renders loading message when isLoading is true", () => {
    render(
      <GenericTable
        data={[]}
        columns={columns}
        isLoading={true}
        loadingMessage={<div data-testid="loader">Loading database...</div>}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading database...")).toBeInTheDocument();
    expect(screen.queryByText("Full Name")).toBeInTheDocument();
  });

  it("renders empty message when data is empty", () => {
    render(
      <GenericTable
        data={[]}
        columns={columns}
        emptyMessage={<div data-testid="empty-message">No subjects found</div>}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByTestId("empty-message")).toBeInTheDocument();
    expect(screen.getByText("No subjects found")).toBeInTheDocument();
  });
});
