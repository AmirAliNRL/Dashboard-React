import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import FetchData from "../../../Utils/FetchData";
import notify from "../../../Utils/Notify";
import Loading from "../../../Components/Loading";

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [information, setInformation] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [brandRes, catRes, productRes] = await Promise.all([
        FetchData("brands", { headers: { authorization: `bearer ${token}` } }),
        FetchData("categories", {
          headers: { authorization: `bearer ${token}` },
        }),
        FetchData(`products/${id}`, {
          headers: { authorization: `bearer ${token}` },
        }),
      ]);

      if (brandRes?.success) setBrands(brandRes.data);
      if (catRes?.success) setCategories(catRes.data);

      if (productRes?.success) {
        const p = productRes.data;

        setTitle(p.title || "");
        setDescription(p.description || "");
        setBrandId(p.brandId?._id || "");
        setCategoryId(p.categoryId?._id || "");
        setIsPublished(p.isPublished);

        setInformation(
          p.information?.length ? p.information : [{ key: "", value: "" }],
        );

        setVariants(p.variants || []);

        setImages(
          (p.images || []).map((img, i) => ({
            id: i,
            local: false,
            remove: false,
            data: img,
          })),
        );
      }

      setLoading(false);
    };

    if (token) loadData();
  }, [id, token]);

  const addInformation = () => {
    setInformation([...information, { key: "", value: "" }]);
  };

  const updateInformation = (index, field, value) => {
    const list = [...information];
    list[index][field] = value;
    setInformation(list);
  };

  const removeInformation = (index) => {
    setInformation(information.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: "",
        price: 0,
        discount: 0,
        stock: 0,
        isDefault: false,
      },
    ]);
  };

  const updateVariant = (index, field, value) => {
    const list = [...variants];
    list[index][field] = value;
    setVariants(list);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addImages = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      local: true,
      remove: false,
      data: file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, remove: true } : img)),
    );
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(import.meta.env.VITE_BASE_URL + "upload", {
      method: "POST",
      headers: {
        authorization: `bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    return data?.filename;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    let finalImages = [];

    for (let img of images) {
      if (img.remove && !img.local) {
        await fetch(import.meta.env.VITE_BASE_URL + "upload", {
          method: "DELETE",
          headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ filename: img.data }),
        });
      }

      if (!img.remove && !img.local) {
        finalImages.push(img.data);
      }

      if (!img.remove && img.local) {
        const filename = await uploadFile(img.data);
        finalImages.push(filename);
      }
    }

    const payload = {
      title,
      description,
      brandId,
      categoryId,
      isPublished,
      information,
      variants,
      images: finalImages,
    };

    const result = await FetchData(`products/${id}`, {
      method: "PATCH",
      headers: {
        authorization: `bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (result?.success) {
      notify("success", "محصول ویرایش شد");
      navigate("/dashboard/products");
    } else {
      notify("error", result?.message || "خطا");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form
        onSubmit={submitHandler}
        className="flex flex-col gap-6 bg-slate-900 p-6 rounded-2xl border border-purple-800"
      >
        <h1 className="text-2xl font-bold text-purple-200">ویرایش محصول</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان محصول"
          className="p-3 rounded bg-purple-950 border border-purple-700 text-white"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات"
          className="p-3 rounded bg-purple-950 border border-purple-700 text-white"
        />

        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="p-3 rounded bg-purple-950 border border-purple-700 text-white"
        >
          <option value="">انتخاب برند</option>

          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="p-3 rounded bg-purple-950 border border-purple-700 text-white"
        >
          <option value="">انتخاب دسته</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-3 text-white">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          انتشار محصول
        </label>

        <div className="flex flex-col gap-3">
          <h2 className="text-purple-200">تصاویر</h2>

          <input type="file" multiple accept="image/*" onChange={addImages} />

          <div className="flex flex-wrap gap-4">
            {images
              .filter((i) => !i.remove)
              .map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={
                      img.local
                        ? URL.createObjectURL(img.data)
                        : import.meta.env.VITE_BASE_FILE + img.data
                    }
                    className="w-32 h-32 object-cover rounded"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2 rounded"
                  >
                    x
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-purple-200">مشخصات</h2>

          {information.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.key}
                onChange={(e) => updateInformation(i, "key", e.target.value)}
                placeholder="عنوان"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <input
                value={item.value}
                onChange={(e) => updateInformation(i, "value", e.target.value)}
                placeholder="مقدار"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <button
                type="button"
                onClick={() => removeInformation(i)}
                className="bg-red-500 px-3 rounded"
              >
                حذف
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addInformation}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            افزودن
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-purple-200">واریانت‌ها</h2>

          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <input
                value={v.title}
                onChange={(e) => updateVariant(i, "title", e.target.value)}
                placeholder="نام"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <input
                type="number"
                value={v.price}
                onChange={(e) => updateVariant(i, "price", +e.target.value)}
                placeholder="قیمت"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <input
                type="number"
                value={v.discount}
                onChange={(e) => updateVariant(i, "discount", +e.target.value)}
                placeholder="تخفیف"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", +e.target.value)}
                placeholder="موجودی"
                className="p-2 rounded bg-purple-950 border border-purple-700 text-white"
              />

              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="bg-red-500 rounded"
              >
                حذف
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            افزودن واریانت
          </button>
        </div>

        <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold p-3 rounded-xl">
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}
