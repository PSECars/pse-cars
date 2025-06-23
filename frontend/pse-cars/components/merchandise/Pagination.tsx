// components/merchandise/Pagination.tsx
"use client";

import Button from "@/app/components/Button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  onPageChange 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <div className="text-sm text-font-secondary">
        Showing {startItem} to {endItem} of {totalElements} products
      </div>
      
      <div className="flex items-center gap-2">
        {/* Previous button - conditional rendering instead of disabled */}
        {currentPage === 0 ? (
          <div className="p-2 opacity-50 cursor-not-allowed">
            <IconChevronLeft size={16} className="text-font-tertiary" />
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2"
          >
            <IconChevronLeft size={16} />
          </Button>
        )}
        
        {/* Page numbers */}
        {getVisiblePages().map(page => (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "secondary"}
            onClick={() => onPageChange(page)}
            className="px-3 py-2 min-w-[40px]"
          >
            {page + 1}
          </Button>
        ))}
        
        {/* Next button - conditional rendering instead of disabled */}
        {currentPage === totalPages - 1 ? (
          <div className="p-2 opacity-50 cursor-not-allowed">
            <IconChevronRight size={16} className="text-font-tertiary" />
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2"
          >
            <IconChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}