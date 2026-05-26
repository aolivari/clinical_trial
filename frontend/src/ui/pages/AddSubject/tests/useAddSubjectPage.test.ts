import { renderHook, act } from "@testing-library/react";
import { useAddSubjectPage } from "../hooks/useAddSubjectPage";

const mockNavigate = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../../hooks/useParticipants", () => ({
  useCreateParticipantMutation: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

describe("useAddSubjectPage Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize form data with default values", () => {
    const { result } = renderHook(() => useAddSubjectPage());

    expect(result.current.formData).toEqual({
      subjectId: "",
      studyGroup: "treatment",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "active",
      age: 35,
      gender: "M",
    });
    expect(result.current.notes).toBe("");
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.formError).toBeNull();
    expect(result.current.showSuccessModal).toBe(false);
    expect(result.current.lastRegisteredId).toBe("");
  });

  it("should handle successful form submission", async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: "1", subjectId: "P007" });

    const { result } = renderHook(() => useAddSubjectPage());

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, subjectId: "P007" }));
    });

    const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit(event);
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await submitPromise;
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      subjectId: "P007",
      studyGroup: "treatment",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "active",
      age: 35,
      gender: "M",
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.formError).toBeNull();
    expect(result.current.lastRegisteredId).toBe("P007");
    expect(result.current.showSuccessModal).toBe(true);
  });

  it("should handle failed form submission", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Duplicate subject ID"));

    const { result } = renderHook(() => useAddSubjectPage());

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, subject_id: "P007" }));
    });

    const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit(event);
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.formError).toBe(
      "Failed to register participant. Subject ID may already exist.",
    );
    expect(result.current.showSuccessModal).toBe(false);
  });

  it("should navigate to dashboard when onNavigateDashboard is called", () => {
    const { result } = renderHook(() => useAddSubjectPage());

    act(() => {
      result.current.onNavigateDashboard();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
