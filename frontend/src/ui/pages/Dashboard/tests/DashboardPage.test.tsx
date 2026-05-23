import { render, screen } from "@testing-library/react";
import { DashboardPage } from "../ui/DashboardPage";
import { useParticipantsQuery } from "../../../../hooks/useParticipants";
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

jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(),
}));

describe("DashboardPage Component", () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams()]);
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
