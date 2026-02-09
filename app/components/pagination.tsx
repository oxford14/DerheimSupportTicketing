"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import MuiPagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Typography from "@mui/material/Typography";

type PaginationProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  pageParam?: string;
};

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  pageParam = "page",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalCount === 0 || totalPages <= 1) return null;

  function buildUrl(page: number) {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete(pageParam);
    else next.set(pageParam, String(page));
    const q = next.toString();
    return q ? `${pathname}?${q}` : pathname;
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        pt: 2,
        borderTop: 1,
        borderColor: "divider",
      }}
      aria-label="Pagination"
    >
      <Typography variant="body2" color="text.secondary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{totalCount}</strong>
      </Typography>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        color="primary"
        showFirstButton
        showLastButton
        renderItem={(item) => (
          <PaginationItem
            component={Link}
            href={item.type === "page" && typeof item.page === "number" ? buildUrl(item.page) : "#"}
            {...item}
          />
        )}
      />
    </Box>
  );
}
