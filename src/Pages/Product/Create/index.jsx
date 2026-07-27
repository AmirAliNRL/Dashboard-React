import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import notify from "../../../Utils/Notify";
import FetchData from "../../../Utils/FetchData";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const createVariant = () => ({
  id: makeId(),
  title: "",
  sku: "",
  price: "",
  stock: "",
  isDefault: false,
  image: null,
  imagePreview: "",
});

const normalizeText = (value) => value.trim().replace(/\s+/g, " ");

export default function CreateProduct() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [fetchingInit, setFetchingInit] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [information, setInformation] = useState([{ id: makeId(), key: "", value: "" }]);

  const [productImages, setProductImages] = useState([]);

  const [variants, setVariants] = useState([
    {
      ...createVariant(),
      isDefault: true,
    },
  ]);

  const productImagesRef = useRef([]);
  const variantsRef = useRef([]);

  useEffect(() => {
    productImagesRef.current = productImages;
  }, [productImages]);

  useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);

  useEffect(() => {
    const fetchInit = async () => {
      setFetchingInit(true);
      try {
        const [catRes, brandRes] = await Promise.all([
          FetchData("categories?limit=1000", {
            method: "GET",
            headers: { authorization: `bearer ${token}` },
          }),
          FetchData("brands?limit=1000", {
            method: "GET",
            headers: { authorization: `bearer ${token}` },
          }),
        ]);

        if (catRes?.success) {
          setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        } else {
          notify("warning", catRes?.message || "دریافت دسته‌بندی‌ها با مشکل مواجه شد");
        }

        if (brandRes?.success) {
          setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
        } else {
          notify("warning", brandRes?.message || "دریافت برندها با مشکل مواجه شد");
        }
      } catch (error) {
        notify("error", "خطا در دریافت اطلاعات اولیه");
      } finally {
        setFetchingInit(false);
      }
    };

    if (token) fetchInit();
  }, [token]);

  useEffect(() => {
    return () => {
      productImagesRef.current.forEach((img) => {
        if (img.url) URL.revokeObjectURL(img.url);
      });

      variantsRef.current.forEach((variant) => {
        if (variant.imagePreview) {
          URL.revokeObjectURL(variant.imagePreview);
        }
      });
    };
  }, []);

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}upload`, {
        method: "POST",
        headers: { authorization: `bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("upload request failed");
      }

      const data = await res.json();

      if (data?.success && data?.data) {
        return data.data;
      }

      throw new Error(data?.message || "upload failed");
    } catch (error) {
      return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addInformation = () => {
    setInformation((prev) => [...prev, { id: makeId(), key: "", value: "" }]);
  };

  const updateInformation = (id, field, value) => {
    setInformation((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeInformation = (id) => {
    if (information.length === 1) return;
    setInformation((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      notify("warning", "فقط فایل‌های تصویری مجاز هستند");
    }

    const existingKeys = new Set(
      productImages.map((item) => `${item.name}-${item.size}`)
    );

    const uniqueNewFiles = imageFiles.filter(
      (file) => !existingKeys.has(`${file.name}-${file.size}`)
    );

    if (!uniqueNewFiles.length) {
      notify("warning", "این تصاویر قبلاً انتخاب شده‌اند");
      e.target.value = "";
      return;
    }

    const preparedFiles = uniqueNewFiles.map((file) => ({
      id: makeId(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setProductImages((prev) => [...prev, ...preparedFiles]);
    e.target.value = "";
  };

  const removeProductImage = (id) => {
    setProductImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, createVariant()]);
  };

  const updateVariant = (id, field, value) => {
    if (field === "isDefault") {
      setVariants((prev) =>
        prev.map((variant) => ({
          ...variant,
          isDefault: variant.id === id ? value : false,
        }))
      );
      return;
    }

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleVariantImageChange = (id, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("warning", "فقط فایل تصویری برای واریانت مجاز است");
      return;
    }

    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== id) return variant;

        if (variant.imagePreview) {
          URL.revokeObjectURL(variant.imagePreview);
        }

        return {
          ...variant,
          image: file,
          imagePreview: URL.createObjectURL(file),
        };
      })
    );
  };

  const removeVariantImage = (id) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== id) return variant;

        if (variant.imagePreview) {
          URL.revokeObjectURL(variant.imagePreview);
        }

        return {
          ...variant,
          image: null,
          imagePreview: "",
        };
      })
    );
  };

  const removeVariant = (id) => {
    if (variants.length === 1) {
      notify("warning", "حداقل یک واریانت باید وجود داشته باشد");
      return;
    }

    setVariants((prev) => {
      const target = prev.find((variant) => variant.id === id);

      if (target?.imagePreview) {
        URL.revokeObjectURL(target.imagePreview);
      }

      const filtered = prev.filter((variant) => variant.id !== id);

      const hasDefault = filtered.some((variant) => variant.isDefault);

      if (!hasDefault && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }

      return filtered;
    });
  };

  const normalizedInformation = useMemo(() => {
    return information
      .map((item) => ({
        key: normalizeText(item.key || ""),
        value: normalizeText(item.value || ""),
      }))
      .filter((item) => item.key && item.value);
  }, [information]);

  const normalizedVariants = useMemo(() => {
    return variants.map((variant) => ({
      ...variant,
      title: normalizeText(variant.title || ""),
      sku: normalizeText(variant.sku || ""),
      price: variant.price === "" ? "" : Number(variant.price),
      stock: variant.stock === "" ? "" : Number(variant.stock),
    }));
  }, [variants]);

  const duplicateSkuList = useMemo(() => {
    const skuMap = new Map();

    normalizedVariants.forEach((variant) => {
      if (!variant.sku) return;
      skuMap.set(variant.sku, (skuMap.get(variant.sku) || 0) + 1);
    });

    return [...skuMap.entries()]
      .filter(([_, count]) => count > 1)
      .map(([sku]) => sku);
  }, [normalizedVariants]);

  const validateForm = () => {
    if (!normalizeText(title)) {
      notify("warning", "عنوان محصول الزامی است");
      return false;
    }

    if (!brandId) {
      notify("warning", "انتخاب برند الزامی است");
      return false;
    }

    if (!categoryId) {
      notify("warning", "انتخاب دسته‌بندی الزامی است");
      return false;
    }

    if (!variants.length) {
      notify("warning", "حداقل یک واریانت باید وجود داشته باشد");
      return false;
    }

    const hasDefault = normalizedVariants.some((variant) => variant.isDefault);
    if (!hasDefault) {
      notify("warning", "باید یک واریانت پیش‌فرض انتخاب شود");
      return false;
    }

    if (duplicateSkuList.length > 0) {
      notify("warning", `SKU تکراری یافت شد: ${duplicateSkuList.join(" , ")}`);
      return false;
    }

    for (let i = 0; i < normalizedVariants.length; i++) {
      const variant = normalizedVariants[i];

      if (!variant.title) {
        notify("warning", `عنوان واریانت ${i + 1} الزامی است`);
        return false;
      }

      if (!variant.sku) {
        notify("warning", `SKU واریانت ${i + 1} الزامی است`);
        return false;
      }

      if (variant.price === "" || Number.isNaN(variant.price)) {
        notify("warning", `قیمت واریانت ${i + 1} نامعتبر است`);
        return false;
      }

      if (variant.stock === "" || Number.isNaN(variant.stock)) {
        notify("warning", `موجودی واریانت ${i + 1} نامعتبر است`);
        return false;
      }

      if (variant.price < 0) {
        notify("warning", `قیمت واریانت ${i + 1} نمی‌تواند منفی باشد`);
        return false;
      }

      if (variant.stock < 0) {
        notify("warning", `موجودی واریانت ${i + 1} نمی‌تواند منفی باشد`);
        return false;
      }
    }

    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      const uploadedProductImages = [];

      for (const img of productImages) {
        const url = await uploadFile(img.file);
        if (!url) {
          notify("error", `آپلود تصویر محصول "${img.name}" ناموفق بود`);
          setLoading(false);
          return;
        }
        uploadedProductImages.push(url);
      }

      const finalVariants = [];

      for (const v of normalizedVariants) {
        let imageUrl = "";

        if (v.image) {
          imageUrl = await uploadFile(v.image);
          if (!imageUrl) {
            notify("error", `آپلود تصویر واریانت "${v.title}" ناموفق بود`);
            setLoading(false);
            return;
          }
        }

        finalVariants.push({
          title: v.title,
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
          isDefault: Boolean(v.isDefault),
          image: imageUrl,
        });
      }

      const payload = {
        title: normalizeText(title),
        description: normalizeText(description),
        brandId,
        categoryId,
        isPublished,
        information: normalizedInformation,
        images: uploadedProductImages,
        variants: finalVariants,
      };

      const result = await FetchData("products", {
        method: "POST",
        headers: {
          authorization: `bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (result?.success) {
        notify("success", "محصول با موفقیت ایجاد شد");
        navigate("/dashboard/product");
      } else {
        notify("error", result?.message || "خطا در ایجاد محصول");
      }
    } catch (err) {
      notify("error", "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <form onSubmit={submitHandler} className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-purple-200">ایجاد محصول</h1>
          {fetchingInit && (
            <span className="text-sm text-purple-300">در حال دریافت اطلاعات اولیه...</span>
          )}
        </div>

        {/* اطلاعات پایه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            className="p-3 rounded-lg bg-purple-950 border border-purple-700 text-white"
            placeholder="عنوان محصول"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="p-3 rounded-lg bg-purple-950 border border-purple-700 text-white"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">انتخاب برند</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title}
              </option>
            ))}
          </select>

          <select
            className="p-3 rounded-lg bg-purple-950 border border-purple-700 text-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">انتخاب دسته</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-3 p-3 rounded-lg bg-purple-950 border border-purple-700 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <span>انتشار محصول</span>
          </label>
        </div>

        <textarea
          className="p-3 rounded-lg bg-purple-950 border border-purple-700 text-white min-h-[140px]"
          placeholder="توضیحات"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* اطلاعات محصول */}
        <div className="flex flex-col gap-4">
          <h2 className="text-purple-200 font-bold">اطلاعات محصول</h2>

          {information.map((info) => (
            <div key={info.id} className="flex gap-2">
              <input
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white flex-1"
                placeholder="کلید"
                value={info.key}
                onChange={(e) => updateInformation(info.id, "key", e.target.value)}
              />

              <input
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white flex-1"
                placeholder="مقدار"
                value={info.value}
                onChange={(e) => updateInformation(info.id, "value", e.target.value)}
              />

              <button
                type="button"
                onClick={() => removeInformation(info.id)}
                className="text-red-500"
              >
                <IoMdTrash size={20} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addInformation}
            className="flex items-center gap-2 text-green-400 w-fit"
          >
            <IoMdAdd />
            افزودن ویژگی
          </button>
        </div>

        {/* تصاویر محصول */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-purple-200 font-bold text-lg">تصاویر محصول</h2>

            {productImages.length > 0 && (
              <span className="text-xs text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full border border-purple-700">
                {productImages.length} تصویر انتخاب شده
              </span>
            )}
          </div>

          <label
            htmlFor="product-images"
            className="group relative flex flex-col items-center justify-center w-full min-h-[180px] px-6 py-10 border-2 border-dashed border-purple-700 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-950/50 to-purple-900/30 hover:border-purple-500 hover:bg-purple-900/40 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-800/50 border border-purple-700 flex items-center justify-center text-purple-200 text-3xl group-hover:scale-110 transition">
                +
              </div>

              <span className="text-lg font-bold text-purple-100">
                انتخاب تصاویر محصول
              </span>

              <span className="mt-2 text-sm text-purple-300">
                برای انتخاب فایل کلیک کنید
              </span>

              <span className="mt-2 text-xs text-purple-400">
                فرمت‌های مجاز: PNG, JPG, JPEG, WEBP
              </span>
            </div>
          </label>

          <input
            id="product-images"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleProductImagesChange}
          />

          {productImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-2xl border border-purple-800 bg-purple-950/40 shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-purple-900/30">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium text-purple-100 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-purple-400">
                      {formatFileSize(image.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeProductImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white text-xs px-3 py-1 rounded-lg shadow transition"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* واریانت‌ها */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-purple-200 font-bold">واریانت‌ها</h2>

            {duplicateSkuList.length > 0 && (
              <span className="text-xs text-red-300 bg-red-900/30 border border-red-700 px-3 py-1 rounded-full">
                SKU تکراری: {duplicateSkuList.join(" , ")}
              </span>
            )}
          </div>

          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="border border-purple-800 p-4 rounded-2xl flex flex-col gap-4 bg-purple-950/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">واریانت {index + 1}</h3>

                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeVariant(variant.id)}
                >
                  <IoMdTrash size={20} />
                </button>
              </div>

              <input
                placeholder="عنوان"
                className="p-3 bg-purple-950 border border-purple-700 rounded text-white"
                value={variant.title}
                onChange={(e) => updateVariant(variant.id, "title", e.target.value)}
              />

              <input
                placeholder="شناسه داخلی کالا در انبار"
                className="p-3 bg-purple-950 border border-purple-700 rounded text-white"
                value={variant.sku}
                onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="قیمت"
                className="p-3 bg-purple-950 border border-purple-700 rounded text-white"
                value={variant.price}
                onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="موجودی"
                className="p-3 bg-purple-950 border border-purple-700 rounded text-white"
                value={variant.stock}
                onChange={(e) => updateVariant(variant.id, "stock", e.target.value)}
              />

              <label className="flex items-center gap-3 text-sm text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variant.isDefault}
                  onChange={(e) =>
                    updateVariant(variant.id, "isDefault", e.target.checked)
                  }
                />
                واریانت پیش‌فرض
              </label>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-purple-200">
                  تصویر واریانت
                </label>

                <label
                  htmlFor={`variant-image-${variant.id}`}
                  className="group flex flex-col items-center justify-center w-full min-h-[150px] px-5 py-6 rounded-2xl border-2 border-dashed border-purple-700 bg-gradient-to-br from-purple-950/50 to-purple-900/20 cursor-pointer hover:border-purple-500 hover:bg-purple-900/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-800/50 border border-purple-700 flex items-center justify-center text-2xl text-purple-200 group-hover:scale-110 transition">
                    +
                  </div>

                  <span className="mt-3 text-sm font-bold text-purple-100">
                    {variant.image ? "تغییر تصویر واریانت" : "انتخاب تصویر واریانت"}
                  </span>

                  <span className="mt-1 text-xs text-purple-400">
                    فقط یک تصویر مجاز است
                  </span>

                  {variant.image && (
                    <span className="mt-2 text-xs text-green-400 max-w-full truncate">
                      {variant.image.name}
                    </span>
                  )}
                </label>

                <input
                  id={`variant-image-${variant.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleVariantImageChange(variant.id, file);
                    e.target.value = "";
                  }}
                />

                {variant.imagePreview && (
                  <div className="relative overflow-hidden rounded-2xl border border-purple-800 bg-purple-950/40">
                    <img
                      src={variant.imagePreview}
                      alt="پیش‌نمایش واریانت"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantImage(variant.id)}
                      className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow transition"
                    >
                      حذف تصویر
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 text-green-400 w-fit"
          >
            <IoMdAdd />
            افزودن واریانت
          </button>
        </div>

        <button
          disabled={loading || fetchingInit}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold p-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "در حال ثبت..." : "ثبت محصول"}
        </button>
      </form>
    </div>
  );
}
