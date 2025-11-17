import React, { useEffect, useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
}

export interface FetchParams {
  page: number;
  pageSize: number;
  search: string;
}

export interface FetchResult<T> {
  data: T[];
  total: number;
}

export interface BaseTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  fetchData?: (params: FetchParams) => Promise<FetchResult<T>>;
  initialPageSize?: number;
  serverSide?: boolean;
}

export function BaseTable<T extends { id?: string | number }>({
  columns,
  data = [],
  fetchData,
  initialPageSize = 10,
  serverSide = false,
}: BaseTableProps<T>) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 1) / pageSize)),
    [total, pageSize]
  );

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        if (serverSide && typeof fetchData === "function") {
          const res = await fetchData({ page, pageSize, search });
          if (!mounted) return;
          setRows(res?.data ?? []);
          setTotal(Number(res?.total ?? res?.data?.length ?? 0));
        } else {
          const start = (page - 1) * pageSize;
          const slice = (data ?? []).slice(start, start + pageSize);
          setRows(slice);
          setTotal((data ?? []).length);
        }
      } catch (err) {
        console.error("BaseTable fetch error:", err);
        if (mounted) {
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [page, pageSize, data, fetchData, serverSide, search]);

  const gotoPage = (p: number | string) => {
    const newPage = Math.max(1, Math.min(totalPages, Number(p) || 1));
    setPage(newPage);
  };

  const renderCell = (col: Column<T>, row: T) =>
    typeof col.render === "function"
      ? col.render(row)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (row as any)[col.key] ?? "";

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {/* Header: Search + PageSize */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="🔍 Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <span className="text-gray-600 text-sm">
            {loading ? "Đang tải..." : `Tổng ${total} bản ghi`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Hiển thị</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              {columns.map((c) => (
                <th key={String(c.key)} className="px-3 py-2 font-semibold">
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-4 text-center text-gray-500"
                >
                  {loading ? "Đang tải..." : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id ?? i} className="border-t hover:bg-gray-50">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-3 py-2 align-top">
                      {renderCell(c, r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between mt-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Trước
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau →
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label>Đi tới</label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={page}
            onChange={(e) => gotoPage(e.target.value)}
            className="w-16 border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
