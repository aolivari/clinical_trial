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
    total_participants: 6,
    active_count: 4,
    completed_count: 1,
    withdrawn_count: 1,
    treatment_count: 3,
    control_count: 3,
    male_count: 3,
    female_count: 3,
    other_gender_count: 0,
    retention_rate: 83.3,
    completion_rate: 16.7,
    avg_age: 44.8,
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
            participant_id: "1",
            subject_id: "P001",
            study_group: "treatment",
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
    expect(screen.getByText("6")).toBeInTheDocument(); // total_participants
    expect(screen.getByText("83.3%")).toBeInTheDocument(); // retention_rate (one of them)
    expect(screen.getByText("44.8 yrs")).toBeInTheDocument(); // avg_age
  });

  it("filters participants based on search query", () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams("search=P002"),
    ]);
    (useParticipantsQuery as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            participant_id: "1",
            subject_id: "P001",
            study_group: "treatment",
            status: "active",
          },
          {
            participant_id: "2",
            subject_id: "P002",
            study_group: "control",
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
