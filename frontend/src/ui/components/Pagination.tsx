import React from "react";

interface PaginationProps {
  currentPageIndex: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPageIndex,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  if (totalPages <= 0) return null;

  return (
    <div className="px-lg py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/30 text-xs">
      <span className="font-body-md text-on-surface-variant" data-testid="pagination-info">
        Page {currentPageIndex} of {totalPages} — {totalItems} total entries
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(currentPageIndex - 1, 1))}
          disabled={currentPageIndex === 1}
          className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous Page"
        >
          <span className="material-symbols-outlined text-[16px] block">chevron_left</span>
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPageIndex === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "hover:bg-surface-variant text-on-surface"
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(currentPageIndex + 1, totalPages))}
          disabled={currentPageIndex === totalPages}
          className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Next Page"
        >
          <span className="material-symbols-outlined text-[16px] block">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
