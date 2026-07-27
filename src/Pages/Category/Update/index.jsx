import React, { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import notify from "../../../Utils/Notify";
import FetchData from "../../../Utils/FetchData";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../Components/Loading";

export default function UpdateCategory() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [supCategoryId, setSupCategoryId] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [img, setImg] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // دریافت اطلاعات دسته‌بندی و لیست والدین برای dropdown
  useEffect(() => {
    (async () => {
      setLoading(true);
      // دریافت لیست تمام دسته‌بندی‌ها برای انتخاب والد
      const catList = await FetchData("categories", { headers: { authorization: `bearer ${token}` } });
      if (catList?.success) setAllCategories(catList.data);

      // دریافت اطلاعات همین دسته‌بندی
      const result = await FetchData(`categories/${id}`, {
        headers: { authorization: `bearer ${token}` },
      });

      if (result?.success) {
        const cat = result.data;
        setTitle(cat.title);
        setIsPublished(cat.isPublished);
        setSupCategoryId(cat.supCategoryId?._id || "");
        if (cat.image) {
          setImg([{ id: 1, local: false, remove: false, data: cat.image }]);
        }
      }
      setLoading(false);
    })();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image = "";
    // منطق آپلود عکس (مشابه برند)
    for (let imgItem of img) {
      if (imgItem.local && imgItem.remove) continue;
      if (!imgItem.local && !imgItem.remove) {
        image = imgItem.data;
        break;
      }
      if (imgItem.local && !imgItem.remove) {
        const formData = new FormData();
        formData.append("file", imgItem.data);
        const resImg = await fetch(import.meta.env.VITE_BASE_URL + "upload", {
          method: "POST",
          headers: { authorization: `bearer ${token}` },
          body: formData,
        });
        const dataImg = await resImg.json();
        if (dataImg.success) image = dataImg.data;
        else { notify("error", "خطا در آپلود عکس"); setLoading(false); return; }
      }
      if (!imgItem.local && imgItem.remove) {
        await fetch(import.meta.env.VITE_BASE_URL + "upload", {
          method: "DELETE",
          headers: { authorization: `bearer ${token}`, "Content-type": "application/json" },
          body: JSON.stringify({ filename: imgItem.data }),
        });
      }
    }

    const result = await FetchData(`categories/${id}`, {
      method: "PATCH",
      headers: { authorization: `bearer ${token}`, "Content-type": "application/json" },
      body: JSON.stringify({ title, isPublished, image, supCategoryId: supCategoryId || null }),
    });

    if (result.success) {
      notify("success", result.message);
      navigate("/dashboard/category");
    } else {
      notify("error", result.message);
    }
    setLoading(false);
  };

  const items = img?.filter((item) => !item.remove).map((imgItem) => (
    <div key={imgItem?.data?.name || imgItem?.data} className="mt-4 relative max-w-sm rounded-xl overflow-hidden border border-purple-800">
      <img
        src={imgItem.local ? URL.createObjectURL(imgItem.data) : import.meta.env.VITE_BASE_FILE + imgItem.data}
        alt="preview" className="h-40 w-full object-cover"
      />
      <button type="button" onClick={() => setImg(img.map(i => i.id === imgItem.id ? {...i, remove: true} : i))}
        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-purple-500 hover:text-white transition">
        <IoMdCloseCircleOutline className="text-2xl text-purple-700" />
      </button>
    </div>
  ));

  if (loading && title === "") return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 w-full max-w-md rounded-2xl bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 p-8 shadow-2xl border border-purple-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-purple-300">ویرایش دسته‌بندی</h2>
      
      <label className="block mb-4">
        <span className="text-purple-200">عنوان دسته‌بندی</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="mt-2 w-full rounded-lg border border-purple-800 bg-slate-900 text-purple-100 px-4 py-2 focus:ring-1 focus:ring-purple-500 outline-none" />
      </label>

      <label className="block mb-4">
        <span className="text-purple-200">دسته‌بندی والد (اختیاری)</span>
        <select value={supCategoryId} onChange={(e) => setSupCategoryId(e.target.value)}
          className="mt-2 w-full rounded-lg border border-purple-800 bg-slate-900 text-purple-100 px-4 py-2 focus:ring-1 focus:ring-purple-500 outline-none">
          <option value="">بدون والد (ریشه)</option>
          {allCategories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </label>

      <label className="block mb-4">
        <span className="text-purple-200">تصویر</span>
        <label className="mt-2 flex flex-col items-center justify-center p-6 bg-purple-800/50 rounded-xl border border-dashed border-purple-600 cursor-pointer hover:bg-purple-800">
          <FaCloudUploadAlt className="text-3xl text-purple-300" />
          <input type="file" accept="image/*" hidden onChange={(e) => {
            if (img.find(i => !i.remove)) return notify("error", "ابتدا عکس قبلی را حذف کنید");
            if (e.target.files.length) setImg([{ id: Date.now(), local: true, remove: false, data: e.target.files[0] }]);
          }} />
        </label>
        {items}
      </label>

      <label className="flex items-center mb-6">
        <input type="checkbox" checked={isPublished} onChange={() => setIsPublished(!isPublished)} className="accent-purple-600 h-5 w-5" />
        <span className="ml-2 text-purple-200">انتشار در سایت</span>
        {isPublished && <FaCheckCircle className="ml-2 text-green-400" />}
      </label>

      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-600 transition">
        {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}
