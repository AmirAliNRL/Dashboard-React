import React, { useEffect, useMemo, useState } from "react";
import FetchData from "../../../Utils/FetchData";
import { useSelector } from "react-redux";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import notify from "../../../Utils/Notify";
import Loading from "../../../Components/Loading";

const toInt = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function GetAllCategory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [categories, setCategories] = useState(null);
  const [countOfCategories, setCountOfCategories] = useState(0);
  const [sort, setSort] = useState("-createdAt"); // پیش‌فرض: جدیدترین
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const totalPages = useMemo(() => {
    const total = toInt(countOfCategories, 0);
    const perPage = Math.max(1, toInt(limit, 20));
    return Math.max(1, Math.ceil(total / perPage));
  }, [countOfCategories, limit]);

  // keep page in range if count/limit changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    setLoading(true);

    const result = await FetchData(
      `categories?page=${page}&limit=${limit}&sort=${sort}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`,
      {
        method: "GET",
        headers: {
          authorization: `bearer ${token}`,
        },
      }
    );

    if (result?.success) {
      setCategories(Array.isArray(result.data) ? result.data : []);
      setCountOfCategories(toInt(result.count, 0));
    } else {
      setCategories([]);
      setCountOfCategories(0);
      notify("error", result?.message || "بارگذاری دسته‌بندی‌ها ناموفق بود");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit, search, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (id) => {
    const result = await FetchData(`categories/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `bearer ${token}`,
      },
    });

    if (result?.success) {
      setCategories((prev) => (prev || []).filter((item) => item?._id !== id));
      setCountOfCategories((c) => Math.max(0, toInt(c, 0) - 1));
      notify("success", result.message);
    } else {
      // اینجا معمولاً ارور "this Category contain some product you can not deleted or have sub Categories"
      notify("error", result?.message || "حذف دسته‌بندی ناموفق بود");
    }
  };

  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    const pages = [];
    const tp = totalPages;

    if (tp <= maxButtons) {
      for (let i = 1; i <= tp; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(1, page - 2);
    const right = Math.min(tp, page + 2);

    pages.push(1);
    if (left > 2) pages.push("…");
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== tp) pages.push(i);
    }
    if (right < tp - 1) pages.push("…");
    pages.push(tp);

    return pages;
  }, [page, totalPages]);

  if (!categories) return <Loading />;

  return (
    <div className="bg-purple-950/40 border border-purple-800 rounded-xl p-6 shadow-lg space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sort */}
        <select
          onChange={(e) => setSort(e.target.value)}
          value={sort}
          className="bg-purple-900/40 border border-purple-700 text-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="-title">عنوان: A → Z</option>
          <option value="title">عنوان: Z → A</option>
          <option value="-createdAt">جدیدترین</option>
          <option value="createdAt">قدیمی‌ترین</option>
        </select>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-purple-400" />
          <input
            type="text"
            placeholder="جستجوی دسته‌بندی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-purple-900/40 border border-purple-700 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <p className="text-purple-300 text-center py-10">
          هیچ دسته‌بندی‌ای یافت نشد
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((item) => {
            const hasImage = !!item?.image;
            const parentTitle = item?.supCategoryId?.title || null;
            const isPublished = item?.isPublished;

            return (
              <div
                key={item._id}
                className="bg-purple-900/40 border border-purple-800 rounded-xl p-4 flex flex-col items-center text-center hover:border-purple-600 transition group"
              >
                {/* Image / Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden border border-purple-700 mb-3 bg-purple-950 flex items-center justify-center">
                  {hasImage ? (
                    <img
                      src={import.meta.env.VITE_BASE_FILE + item.image}
                      alt={item?.title || "category"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-purple-300">
                      {item?.title?.charAt(0)?.toUpperCase() || "C"}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-purple-100 font-semibold text-sm mb-1">
                  {item.title}
                </h3>

                {/* Parent Category / Status */}
                <div className="text-xs text-purple-300 mb-2 space-y-1">
                  {parentTitle && (
                    <p className="flex flex-col">
                      <span className="text-purple-400">زیرمجموعه:</span>
                      <span>{parentTitle}</span>
                    </p>
                  )}
                  <p>
                    وضعیت:{" "}
                    <span
                      className={
                        isPublished
                          ? "text-green-400 font-medium"
                          : "text-red-400 font-medium"
                      }
                    >
                      {isPublished ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 text-lg opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/category/update/${item._id}`)
                    }
                    className="text-purple-400 hover:text-purple-300"
                    title="ویرایش"
                  >
                    <MdEdit />
                  </button>

                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-400"
                    title="حذف"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 bg-purple-800 rounded-lg disabled:opacity-40 hover:bg-purple-700 transition"
        >
          <FiChevronLeft />
        </button>

        {pageNumbers.map((num, i) =>
          num === "…" ? (
            <span key={i} className="px-2 text-purple-400">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                page === num
                  ? "bg-purple-600 text-white"
                  : "bg-purple-900/40 text-purple-300 hover:bg-purple-700"
              }`}
            >
              {num}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 bg-purple-800 rounded-lg disabled:opacity-40 hover:bg-purple-700 transition"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
