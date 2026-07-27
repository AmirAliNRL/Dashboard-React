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

const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("fa-IR").format(num);
};

export default function GetAllProduct() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [products, setProducts] = useState(null);
  const [countOfProducts, setCountOfProducts] = useState(0);
  const [sort, setSort] = useState("-createdAt");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const totalPages = useMemo(() => {
    const total = toInt(countOfProducts, 0);
    const perPage = Math.max(1, toInt(limit, 20));
    return Math.max(1, Math.ceil(total / perPage));
  }, [countOfProducts, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    setLoading(true);

    const result = await FetchData(
      `products?page=${page}&limit=${limit}&sort=${sort}${
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
      setProducts(Array.isArray(result.data) ? result.data : []);
      setCountOfProducts(toInt(result.count, 0));
    } else {
      setProducts([]);
      setCountOfProducts(0);
      notify("error", result?.message || "بارگذاری محصولات ناموفق بود");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (id) => {
    const result = await FetchData(`products/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `bearer ${token}`,
      },
    });

    if (result?.success) {
      setProducts((prev) => (prev || []).filter((item) => item?._id !== id));
      setCountOfProducts((c) => Math.max(0, toInt(c, 0) - 1));
      notify("success", result.message || "محصول با موفقیت حذف شد");
    } else {
      notify("error", result?.message || "حذف محصول ناموفق بود");
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

  if (!products) return <Loading />;

  return (
    <div className="bg-purple-950/40 border border-purple-800 rounded-xl p-6 shadow-lg space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sort */}
        <div className="flex flex-wrap gap-3">
          <select
            onChange={(e) => setSort(e.target.value)}
            value={sort}
            className="bg-purple-900/40 border border-purple-700 text-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="-createdAt">جدیدترین</option>
            <option value="createdAt">قدیمی‌ترین</option>
            <option value="-title">عنوان: A → Z</option>
            <option value="title">عنوان: Z → A</option>
          </select>

          <select
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            value={limit}
            className="bg-purple-900/40 border border-purple-700 text-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-3 text-purple-400" />
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-purple-900/40 border border-purple-700 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <p className="text-purple-300 text-center py-10">هیچ محصولی یافت نشد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((item) => {
            const productImage =
              Array.isArray(item?.images) && item.images.length > 0
                ? item.images[0]
                : null;

            const hasImage = !!productImage;
            const brandTitle = item?.brandId?.title || "-";
            const categoryTitle = item?.categoryId?.title || "-";
            const isPublished = item?.isPublished;
            const variants = Array.isArray(item?.variants) ? item.variants : [];
            const visibleVariants = variants.slice(0, 3);
            const remainVariants = variants.length - visibleVariants.length;

            return (
              <div
                key={item._id}
                className="bg-purple-900/40 border border-purple-800 rounded-xl p-4 flex flex-col gap-4 hover:border-purple-600 transition group"
              >
                {/* Top */}
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-purple-700 bg-purple-950 flex items-center justify-center shrink-0">
                    {hasImage ? (
                      <img
                        src={import.meta.env.VITE_BASE_FILE + productImage}
                        alt={item?.title || "product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-purple-300">
                        {item?.title?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-purple-100 font-bold text-base mb-2 line-clamp-2">
                      {item?.title}
                    </h3>

                    <div className="space-y-1 text-xs text-purple-300">
                      <p>
                        برند: <span className="text-purple-100">{brandTitle}</span>
                      </p>
                      <p>
                        دسته‌بندی:{" "}
                        <span className="text-purple-100">{categoryTitle}</span>
                      </p>
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
                      <p>
                        تعداد واریانت:{" "}
                        <span className="text-purple-100 font-medium">
                          {variants.length}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {item?.description && (
                  <p className="text-sm text-purple-300 line-clamp-3 border-t border-purple-800 pt-3">
                    {item.description}
                  </p>
                )}

                {/* Variants */}
                <div className="border-t border-purple-800 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-purple-100">
                      واریانت‌ها
                    </h4>
                    {variants.length > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-purple-800/70 text-purple-200 border border-purple-700">
                        {variants.length} مورد
                      </span>
                    )}
                  </div>

                  {variants.length === 0 ? (
                    <p className="text-xs text-purple-400">
                      هیچ واریانتی برای این محصول ثبت نشده است
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {visibleVariants.map((variant, idx) => {
                        const variantImage = variant?.image || null;

                        return (
                          <div
                            key={variant?._id || variant?.id || `${item._id}-${idx}`}
                            className="rounded-xl border border-purple-800 bg-purple-950/40 p-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-lg overflow-hidden border border-purple-700 bg-purple-900/40 flex items-center justify-center shrink-0">
                                {variantImage ? (
                                  <img
                                    src={import.meta.env.VITE_BASE_FILE + variantImage}
                                    alt={variant?.title || "variant"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-purple-300">No Img</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 text-xs text-purple-300 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm text-purple-100 font-medium">
                                    {variant?.title || `واریانت ${idx + 1}`}
                                  </p>

                                  {variant?.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">
                                      پیش‌فرض
                                    </span>
                                  )}
                                </div>

                                <p>
                                  SKU:{" "}
                                  <span className="text-purple-100">
                                    {variant?.sku || "-"}
                                  </span>
                                </p>

                                <p>
                                  قیمت:{" "}
                                  <span className="text-purple-100">
                                    {formatPrice(variant?.price)} تومان
                                  </span>
                                </p>

                                <p>
                                  موجودی:{" "}
                                  <span className="text-purple-100">
                                    {toInt(variant?.stock, 0)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {remainVariants > 0 && (
                        <div className="text-xs text-center text-purple-300 bg-purple-800/30 border border-purple-700 rounded-lg py-2">
                          {remainVariants} واریانت دیگر نیز وجود دارد...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-purple-800 flex justify-end gap-3 text-lg opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/product/update/${item._id}`)
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
