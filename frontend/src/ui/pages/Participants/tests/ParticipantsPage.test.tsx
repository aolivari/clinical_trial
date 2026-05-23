import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParticipantsPage } from "../ui/ParticipantsPage";
import {
  useParticipantsQuery,
  useDeleteParticipantMutation,
} from "../../../../hooks/useParticipants";
import { useSearchParams, useNavigate } from "react-router-dom";

jest.mock("../../../../hooks/useParticipants", () => ({
  useParticipantsQuery: jest.fn(),
  useDeleteParticipantMutation: jest.fn(),
  useParticipantQuery: jest
    .fn()
    .mockReturnValue({ data: null, isLoading: false, error: null }),
  useUpdateParticipantMutation: jest
    .fn()
    .mockReturnValue({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("ParticipantsPage Component", () => {
  const mockRefetch = jest.fn();
  const mockDeleteMutateAsync = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams()]);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useDeleteParticipantMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
    });

    // Mock window.confirm and alert
    jest.spyOn(window, "confirm").mockImplementation(() => true);
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    (window.confirm as jest.Mock).mockRestore();
    (window.alert as jest.Mock).mockRestore();
  });

  it("renders participants and delegates data properly", () => {
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

    render(<ParticipantsPage />);
    expect(screen.getByText("P001")).toBeInTheDocument();
  });

  it("filters participants based on group and status filters", async () => {
    const user = userEvent.setup();
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

    render(<ParticipantsPage />);

    // Both should be in the document initially
    expect(screen.getByText("P001")).toBeInTheDocument();
    expect(screen.getByText("P002")).toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");

    // Filter by active status
    await user.selectOptions(comboboxes[0], "active");

    expect(screen.getByText("P001")).toBeInTheDocument();
    expect(screen.queryByText("P002")).not.toBeInTheDocument();
  });

  it("handles deleting a participant", async () => {
    const user = userEvent.setup();
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

    render(<ParticipantsPage />);

    const deleteButtons = screen.getAllByTitle(/delete subject/i);
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith("1");
  });
});

