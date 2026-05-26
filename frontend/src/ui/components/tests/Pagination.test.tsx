import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination Component", () => {
  it("renders page info and correct page buttons", () => {
    render(
      <Pagination
        currentPageIndex={2}
        totalPages={5}
        totalItems={50}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByTestId("pagination-info")).toHaveTextContent(
      "Page 2 of 5 — 50 total entries"
    );

    // Verify all 5 page buttons are rendered
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole("button", { name: `Page ${i}` })).toBeInTheDocument();
    }
  });

  it("calls onPageChange when clicking a page number", () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        currentPageIndex={2}
        totalPages={5}
        totalItems={50}
        onPageChange={handlePageChange}
      />
    );

    const page4Btn = screen.getByRole("button", { name: "Page 4" });
    fireEvent.click(page4Btn);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with prev/next pages when chevron buttons are clicked", () => {
    const handlePageChange = jest.fn();
    const { rerender } = render(
      <Pagination
        currentPageIndex={3}
        totalPages={5}
        totalItems={50}
        onPageChange={handlePageChange}
      />
    );

    const prevBtn = screen.getByRole("button", { name: "Previous Page" });
    const nextBtn = screen.getByRole("button", { name: "Next Page" });

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenLastCalledWith(2);

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenLastCalledWith(4);

    // Rerender at page 1 to test disabled prev button
    rerender(
      <Pagination
        currentPageIndex={1}
        totalPages={5}
        totalItems={50}
        onPageChange={handlePageChange}
      />
    );
    expect(screen.getByRole("button", { name: "Previous Page" })).toBeDisabled();

    // Rerender at page 5 to test disabled next button
    rerender(
      <Pagination
        currentPageIndex={5}
        totalPages={5}
        totalItems={50}
        onPageChange={handlePageChange}
      />
    );
    expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
  });

  it("returns null if totalPages is 0 or negative", () => {
    const { container } = render(
      <Pagination
        currentPageIndex={1}
        totalPages={0}
        totalItems={0}
        onPageChange={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
