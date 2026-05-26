import { render, screen } from "@testing-library/react";
import { DashboardPage } from "../ui/DashboardPage";
import { useParticipantsQuery } from "../../../../hooks/useParticipants";
import { useMetricsQuery } from "../../../../hooks/useMetrics";
import { useSearchParams } from "react-router-dom";

jest.mock("../../../../hooks/useParticipants", () => ({
  useParticipantsQuery: jest.fn(),
  useParticipantQuery: jest
    .fn()
    .mockReturnValue({ data: null, isLoading: false, error: null }),
  useUpdateParticipantMutation: jest
    .fn()
    .mockReturnValue({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("../../../../hooks/useMetrics", () => ({
  useMetricsQuery: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(),
}));

describe("DashboardPage Component", () => {
  const mockRefetch = jest.fn();

  const mockMetrics = {
    totalParticipants: 6,
    activeCount: 4,
    completedCount: 1,
    withdrawnCount: 1,
    treatmentCount: 3,
    controlCount: 3,
    maleCount: 3,
    femaleCount: 3,
    otherGenderCount: 0,
    retentionRate: 83.3,
    completionRate: 16.7,
    avgAge: 44.8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams()]);
    (useMetricsQuery as jest.Mock).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
    });
  });

  it("passes data and totalItems to DashboardView when query is successful", () => {
    (useParticipantsQuery as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            participantId: "1",
            subjectId: "P001",
            studyGroup: "treatment",
            status: "active",
          },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);
    expect(screen.getByText("P001")).toBeInTheDocument();
  });

  it("renders live metrics from the API", () => {
    (useParticipantsQuery as jest.Mock).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    // Verify KPI values rendered from mock metrics
    expect(screen.getByText("6")).toBeInTheDocument(); // totalParticipants
    expect(screen.getAllByText("83.3%")[0]).toBeInTheDocument(); // retentionRate (one of them)
    expect(screen.getByText("44.8 yrs")).toBeInTheDocument(); // avgAge
  });

  it("filters participants based on search query", () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams("search=P002"),
    ]);
    (useParticipantsQuery as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            participantId: "1",
            subjectId: "P001",
            studyGroup: "treatment",
            status: "active",
          },
          {
            participantId: "2",
            subjectId: "P002",
            studyGroup: "control",
            status: "completed",
          },
        ],
        total: 2,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    // P002 should be in the document
    expect(screen.getByText("P002")).toBeInTheDocument();

    // P001 should be filtered out
    expect(screen.queryByText("P001")).not.toBeInTheDocument();
  });
});
