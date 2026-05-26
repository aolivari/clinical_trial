import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParticipantDetailsModal } from "../ParticipantDetailsModal";
import { useParticipantQuery, useUpdateParticipantMutation } from "../../../hooks/useParticipants";

jest.mock("../../../hooks/useParticipants", () => ({
  useParticipantQuery: jest.fn(),
  useUpdateParticipantMutation: jest.fn(),
}));

describe("ParticipantDetailsModal Component", () => {
  const mockOnClose = jest.fn();
  const mockMutateAsync = jest.fn();

  const mockParticipant = {
    participantId: "1",
    subjectId: "P001",
    studyGroup: "treatment",
    enrollmentDate: "2026-05-26",
    status: "active",
    age: 45,
    gender: "M",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    (useUpdateParticipantMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    });
  });

  it("renders null if participantId is not provided", () => {
    const { container } = render(
      <ParticipantDetailsModal participantId={null} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows loading indicator when isLoading is true", () => {
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);
    expect(screen.getByText(/Fetching participant record/i)).toBeInTheDocument();
  });

  it("shows error banner when query fails", () => {
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: "Database connection failed" },
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("renders participant details in view mode correctly", () => {
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: mockParticipant,
      isLoading: false,
      error: null,
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);

    expect(screen.getByText("Participant Details")).toBeInTheDocument();
    expect(screen.getByText("P001")).toBeInTheDocument();
    expect(screen.getByText("treatment")).toBeInTheDocument();
    expect(screen.getByText("45 years old")).toBeInTheDocument();
    expect(screen.getByText("Male (M)")).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("can switch to edit mode and submit changes", async () => {
    const user = userEvent.setup();
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: mockParticipant,
      isLoading: false,
      error: null,
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);

    const editBtn = screen.getByRole("button", { name: /edit record/i });
    await user.click(editBtn);

    const subjectIdInput = screen.getByLabelText(/Subject ID/i);
    expect(subjectIdInput).toHaveValue("P001");

    const ageInput = screen.getByLabelText(/Age/i);
    await user.clear(ageInput);
    await user.type(ageInput, "50");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: "1",
      data: {
        subjectId: "P001",
        studyGroup: "treatment",
        enrollmentDate: "2026-05-26",
        status: "active",
        age: 50,
        gender: "M",
      },
    });
  });

  it("reverts changes and returns to view mode when cancel is clicked", async () => {
    const user = userEvent.setup();
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: mockParticipant,
      isLoading: false,
      error: null,
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);

    const editBtn = screen.getByRole("button", { name: /edit record/i });
    await user.click(editBtn);

    const ageInput = screen.getByLabelText(/Age/i);
    await user.clear(ageInput);
    await user.type(ageInput, "99");

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    expect(screen.getByText("45 years old")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Subject ID/i)).not.toBeInTheDocument();
  });

  it("calls onClose when the close icon is clicked", async () => {
    const user = userEvent.setup();
    (useParticipantQuery as jest.Mock).mockReturnValue({
      data: mockParticipant,
      isLoading: false,
      error: null,
    });

    render(<ParticipantDetailsModal participantId="1" onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: "close" });
    await user.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
