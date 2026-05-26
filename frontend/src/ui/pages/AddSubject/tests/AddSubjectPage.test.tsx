import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddSubjectPage } from "../ui/AddSubjectPage";
import { useAddSubjectPage } from "../hooks/useAddSubjectPage";

// Mock ParticipantDetailsModal to prevent loading hook/service/client dependencies
jest.mock("../../../components/ParticipantDetailsModal", () => ({
  ParticipantDetailsModal: () => null,
}));

// Mock the useAddSubjectPage custom hook
jest.mock("../hooks/useAddSubjectPage", () => ({
  useAddSubjectPage: jest.fn(),
}));

describe("AddSubjectPage Component", () => {
  const mockSetFormData = jest.fn();
  const mockSetNotes = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockOnNavigateDashboard = jest.fn();

  const defaultMockValues = {
    formData: {
      subjectId: "",
      studyGroup: "treatment",
      enrollmentDate: "2026-05-26",
      status: "active",
      age: 35,
      gender: "M",
    },
    setFormData: mockSetFormData,
    notes: "",
    setNotes: mockSetNotes,
    isSubmitting: false,
    formError: null,
    showSuccessModal: false,
    lastRegisteredId: "",
    handleSubmit: mockHandleSubmit,
    onNavigateDashboard: mockOnNavigateDashboard,
  };

  beforeAll(() => {
    // Workaround for jsdom not implementing HTMLFormElement.prototype.requestSubmit
    HTMLFormElement.prototype.requestSubmit = function (this: HTMLFormElement) {
      const event = new Event("submit", { bubbles: true, cancelable: true });
      this.dispatchEvent(event);
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useAddSubjectPage as jest.Mock).mockReturnValue(defaultMockValues);
  });

  it("renders the register new participant form layout correctly", () => {
    render(<AddSubjectPage />);

    expect(screen.getByText("Register New Participant")).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enrollment Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Study Group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Internal Researcher Notes/i)).toBeInTheDocument();
  });

  it("maps input changes back to the hook setters", async () => {
    const user = userEvent.setup();
    render(<AddSubjectPage />);

    // Subject ID input
    const subjectInput = screen.getByLabelText(/Subject ID/i);
    await user.type(subjectInput, "P008");
    expect(mockSetFormData).toHaveBeenCalled();

    // Notes textarea
    const notesTextarea = screen.getByLabelText(/Internal Researcher Notes/i);
    await user.type(notesTextarea, "Screening normal");
    expect(mockSetNotes).toHaveBeenCalled();
  });

  it("submits the form on register button click", async () => {
    (useAddSubjectPage as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      formData: {
        ...defaultMockValues.formData,
        subjectId: "P001",
      },
    });
    render(<AddSubjectPage />);

    const submitButton = screen.getByRole("button", { name: /Register Participant/i });
    const formElement = submitButton.closest("form");
    if (formElement) {
      fireEvent.submit(formElement);
    }

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("displays a loading spinner and disabled state during submission", () => {
    (useAddSubjectPage as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      isSubmitting: true,
    });

    render(<AddSubjectPage />);

    const submitBtn = screen.getByRole("button", { name: /Registering.../i });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText("rotate_right")).toBeInTheDocument();
  });

  it("displays form error if submission fails", () => {
    (useAddSubjectPage as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      formError: "Failed to register participant. Subject ID may already exist.",
    });

    render(<AddSubjectPage />);

    expect(
      screen.getByText("Failed to register participant. Subject ID may already exist.")
    ).toBeInTheDocument();
  });

  it("renders and triggers clear form button functionality", async () => {
    const user = userEvent.setup();
    render(<AddSubjectPage />);

    const clearButton = screen.getByRole("button", { name: /CLEAR FORM/i });
    await user.click(clearButton);

    expect(mockSetFormData).toHaveBeenCalledWith({
      subjectId: "",
      studyGroup: "treatment",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "active",
      age: 35,
      gender: "F",
    });
    expect(mockSetNotes).toHaveBeenCalledWith("");
  });

  it("shows success modal and navigates to dashboard on close", async () => {
    const user = userEvent.setup();
    (useAddSubjectPage as jest.Mock).mockReturnValue({
      ...defaultMockValues,
      showSuccessModal: true,
      lastRegisteredId: "P123",
    });

    render(<AddSubjectPage />);

    expect(screen.getByText("Registration Successful")).toBeInTheDocument();
    expect(screen.getByText(/has been successfully enrolled/i)).toBeInTheDocument();
    expect(screen.getByText("P123")).toBeInTheDocument();

    const continueBtn = screen.getByRole("button", { name: /Continue to Dashboard/i });
    await user.click(continueBtn);

    expect(mockOnNavigateDashboard).toHaveBeenCalled();
  });
});
