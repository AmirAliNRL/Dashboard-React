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

export default function GetAllBrand() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [brands, setBrands] = useState(null);
  const [countOfBrands, setCountOfBrand] = useState(0);
  const [sort, setSort] = useState("Sort by");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const totalPages = useMemo(() => {
    const total = toInt(countOfBrands, 0);
    const perPage = Math.max(1, toInt(limit, 20));
    return Math.max(1, Math.ceil(total / perPage));
  }, [countOfBrands, limit]);

  // keep page in range if count/limit changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBrands = async () => {
    setLoading(true);
    const result = await FetchData(
      `brands?page=${page}&limit=${limit}&sort=${sort}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`,

      {
        method: "GET",
        headers: {
          authorization: `bearer ${token}`
        },
      },
    );

    if (result?.success) {
      setBrands(Array.isArray(result.data) ? result.data : []);
      setCountOfBrand(toInt(result.count, 0));
    } else {
      setBrands([]);
      setCountOfBrand(0);
      notify("error", result?.message || "Failed to load brands");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, [page, limit, search, sort]);

  const handleRemove = async (id) => {
    const result = await FetchData(`brands/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `bearer ${token}`,
      },
    });

    if (result?.success) {
      setBrands((prev) => (prev || []).filter((item) => item?._id !== id));
      setCountOfBrand((c) => Math.max(0, toInt(c, 0) - 1));
      notify("success", result.message);
    } else {
      notify("error", result?.message || "Delete failed");
    }
  };

  const pageNumbers = useMemo(() => {
    // smart pagination: show up to 7 numbers
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

  if (!brands) return <Loading />;

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
          <option value="-title">A → Z</option>
          <option value="title">Z → A</option>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
        </select>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-purple-400" />
          <input
            type="text"
            placeholder="Search brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-purple-900/40 border border-purple-700 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <Loading />
      ) : brands.length === 0 ? (
        <p className="text-purple-300 text-center py-10">No brands found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((item) => (
            <div
              key={item._id}
              className="bg-purple-900/40 border border-purple-800 rounded-xl p-4 flex flex-col items-center text-center hover:border-purple-600 transition group"
            >
              {/* Image */}
              {item?.image ? (
                <img
                  src={import.meta.env.VITE_BASE_FILE + item.image}
                  alt={item?.title || "brand"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-purple-300">
                  {item?.title?.charAt(0).toUpperCase()}
                </span>
              )}

              {/* Title */}
              <h3 className="text-purple-100 font-semibold text-sm mb-3">
                {item.title}
              </h3>

              {/* Actions */}
              <div className="flex gap-3 text-lg opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => navigate(`/dashboard/brand/update/${item._id}`)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <MdEdit />
                </button>

                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-red-500 hover:text-red-400"
                  title="Delete"
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            </div>
          ))}
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
          ),
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
