"use client";

import { useTransition, useCallback, useMemo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationButtonProps {
  pageCount: number;
  displayPerPage: number;
}

const PaginationButton = ({
  pageCount,
  displayPerPage,
}: PaginationButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, setIsPending] = useTransition();

  const page = searchParams?.get("page") ?? "1";

  const perPage = searchParams?.get("perPage") ?? displayPerPage.toString();

  const siblingCount = 1;

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const paginationRange = useMemo(() => {
    const currentPage = Number(page);
    const range = [];

    for (
      let i = Math.max(2, currentPage - siblingCount);
      i <= Math.min(pageCount - 1, currentPage + siblingCount);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - siblingCount > 2) {
      range.unshift("...");
    }

    if (currentPage + siblingCount < pageCount - 1) {
      range.push("...");
    }

    range.unshift(1);

    if (pageCount !== 1) {
      range.push(pageCount);
    }

    return range;
  }, [pageCount, page, siblingCount]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pb-10">
      <Button
        className="h-8 w-8"
        size="icon"
        variant="outline"
        onClick={() => {
          router.push(
            `${pathname}?${createQueryString({
              page: 1,
              perPage: perPage ?? null,
            })}`
          );
        }}
        disabled={Number(page) === 1 || isPending}
      >
        <DoubleArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">First page</span>
      </Button>

      <Button
        className="h-8 w-8"
        size="icon"
        variant="outline"
        onClick={() => {
          router.push(
            `${pathname}?${createQueryString({
              page: Number(page) - 1,
              perPage: perPage ?? null,
            })}`
          );
        }}
        disabled={Number(page) === 1 || isPending}
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </Button>

      {paginationRange.map((pageNumber, i) =>
        pageNumber === "..." ? (
          <Button
            aria-label="Page separator"
            key={i}
            variant={"outline"}
            className="h-8 w-8"
            disabled
            size="icon"
          >
            ...
          </Button>
        ) : (
          <Button
            key={i}
            aria-label={`Page ${pageNumber}`}
            variant={Number(page) === pageNumber ? "default" : "outline"}
            className="h-8 w-8"
            size="icon"
            onClick={() => {
              startTransition(() => {
                router.push(
                  `${pathname}?${createQueryString({
                    page: pageNumber,
                    perPage: perPage ?? null,
                  })}`
                );
              });
            }}
            disabled={isPending}
          >
            {pageNumber}
          </Button>
        )
      )}

      <Button
        className="h-8 w-8"
        size="icon"
        variant="outline"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: Number(page) + 1,
                perPage: perPage ?? null,
              })}`
            );
          });
        }}
        disabled={Number(page) === pageCount || isPending}
      >
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </Button>

      <Button
        className="h-8 w-8"
        size="icon"
        variant="outline"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: pageCount ?? 10,
                perPage: perPage ?? null,
              })}`
            );
          });
        }}
        disabled={Number(page) === (pageCount ?? 10) || isPending}
      >
        <DoubleArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  );
};

export default PaginationButton;
