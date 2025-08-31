"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formUrlQuery } from "@/lib/url";
import type { JSX } from "react";

interface PaginationComponentProps {
  totalItems: number; // 改为传入总数据量而不是总页数
  itemsPerPage?: number; // 添加每页数量配置
  isLoading?: boolean;
  className?: string;
  pageParam?: string; // 添加URL参数名配置，默认为'page'
}

export function PaginationComponent({
  totalItems,
  itemsPerPage = 10, // 默认每页10条
  isLoading = false,
  className = "",
  pageParam = "page", // 默认使用'page'作为URL参数名
}: PaginationComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = searchParams.get(pageParam);
    const page = pageFromUrl ? Number.parseInt(pageFromUrl, 10) : 1;
    return page > 0 && page <= totalPages ? page : 1;
  });

  useEffect(() => {
    const pageFromUrl = searchParams.get(pageParam);
    const page = pageFromUrl ? Number.parseInt(pageFromUrl, 10) : 1;
    const validPage = page > 0 && page <= totalPages ? page : 1;
    setCurrentPage(validPage);
  }, [searchParams, pageParam, totalPages]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: pageParam,
        value: page.toString(),
      });
      router.push(newUrl, { scroll: false });
    }
  };

  if (isLoading || totalPages <= 1) {
    console.log("不显示分页组件", { isLoading, totalPages });
    return null;
  }

  return (
    <Pagination className={`mt-12 ${className}`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                goToPage(currentPage - 1);
              }
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {(() => {
          const items: JSX.Element[] = [];

          if (currentPage <= 3) {
            const endPage = Math.min(3, totalPages);
            for (let p = 1; p <= endPage; p++) {
              items.push(
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            if (totalPages > 3 && endPage < totalPages) {
              items.push(<PaginationEllipsis key="end-ellipsis" />);
            }
          } else if (currentPage >= totalPages - 2) {
            items.push(<PaginationEllipsis key="start-ellipsis" />);

            const startPage = Math.max(1, totalPages - 2);
            for (let p = startPage; p <= totalPages; p++) {
              items.push(
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            }
          } else {
            items.push(<PaginationEllipsis key="start-ellipsis" />);

            for (let p = currentPage - 1; p <= currentPage + 1; p++) {
              if (p >= 1 && p <= totalPages) {
                items.push(
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            }

            items.push(<PaginationEllipsis key="end-ellipsis" />);
          }

          return items;
        })()}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                goToPage(currentPage + 1);
              }
            }}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function getCurrentPageData<T>(data: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}
