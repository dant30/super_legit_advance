import { useMemo } from "react";

export function usePagination({
  page = 1,
  pageSize = 20,
  totalCount = 0,
  siblingCount = 1,
}) {
  const totalPages = Math.max(1, Math.ceil(Number(totalCount || 0) / Number(pageSize || 1)));
  const currentPage = Math.min(Math.max(1, Number(page || 1)), totalPages);

  const range = useMemo(() => {
    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;
    const pages = [1];

    if (showLeftDots) {
      pages.push("...");
    } else {
      for (let i = 2; i < leftSibling; i += 1) pages.push(i);
    }

    for (let i = leftSibling; i <= rightSibling; i += 1) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (showRightDots) {
      pages.push("...");
    } else {
      for (let i = rightSibling + 1; i < totalPages; i += 1) pages.push(i);
    }

    if (!pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  }, [currentPage, siblingCount, totalPages]);

  return {
    currentPage,
    pageSize: Number(pageSize || 20),
    totalCount: Number(totalCount || 0),
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    range,
  };
}

export default usePagination;
