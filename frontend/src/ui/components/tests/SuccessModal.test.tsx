import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessModal } from "../SuccessModal";

describe("SuccessModal Component", () => {
  it("renders modal details when open", () => {
    render(
      <SuccessModal
        isOpen={true}
        title="Operation Successful"
        description="The subject has been registered."
        actionText="Done"
        onAction={jest.fn()}
      />
    );

    expect(screen.getByText("Operation Successful")).toBeInTheDocument();
    expect(screen.getByText("The subject has been registered.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("calls onAction callback when main action button is clicked", () => {
    const handleAction = jest.fn();
    render(
      <SuccessModal
        isOpen={true}
        title="Success"
        description="Completed"
        actionText="Proceed"
        onAction={handleAction}
      />
    );

    const actionBtn = screen.getByRole("button", { name: "Proceed" });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("does not render modal when isOpen is false", () => {
    const { container } = render(
      <SuccessModal
        isOpen={false}
        title="Success"
        description="Completed"
        actionText="Proceed"
        onAction={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
