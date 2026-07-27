import React, { useEffect, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import notify from "../../../Utils/Notify";
import FetchData from "../../../Utils/FetchData";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateBrand() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [img, setImg] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const result = await FetchData(`brands/${id}`, {
        method: "GET",
        headers: {
          authorization: `bearer ${token}`,
        },
      });
      const brand = result.data[0];
      setTitle(brand.title);
      setIsPublished(brand.isPublished);
      if (brand.image) {
        setImg([
          {
            id: 1,
            local: false,
            remove: false,
            data: brand.image,
          },
        ]);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image = "";

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
          headers: {
            authorization: `bearer ${token}`,
          },
          body: formData,
        });

        const dataImg = await resImg.json();

        if (dataImg.success) {
          image = dataImg.data;
        } else {
          notify("error", dataImg.message || "upload failed try again");
          setLoading(false);
          return;
        }
      }
      if (!imgItem.local && imgItem.remove) {
        const resImg = await fetch(import.meta.env.VITE_BASE_URL + "upload", {
          method: "DELETE",
          headers: {
            authorization: `bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({ filename: imgItem.data }),
        });
        await resImg.json();
      }
    }

    const result = await FetchData(`brands/${id}`, {
      method: "PATCH",
      headers: {
        authorization: `bearer ${token}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        isPublished,
        image,
      }),
    });

    if (result.success) {
      notify("success", result.message);
      navigate("/dashboard/brand");
    } else {
      notify("error", result.message);
    }
    setLoading(false);
  };

  // Compact image preview
  const items = img
    ?.filter((item) => !item.remove)
    .map((imgItem) => (
      <div key={imgItem?.data?.name || imgItem?.data} className="mt-2">
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-tl from-purple-900 via-purple-950 to-slate-900 shadow-lg">
          <img
            src={
              imgItem.local
                ? URL.createObjectURL(imgItem.data)
                : import.meta.env.VITE_BASE_FILE + imgItem.data
            }
            alt="brand preview"
            className="h-40 w-full object-cover object-center rounded-xl"
          />
          <button
            type="button"
            onClick={() => {
              const newImages = img?.map((i) => {
                if (i.id === imgItem.id) i.remove = true;
                return i;
              });
              setImg(newImages);
            }}
            className="
              absolute top-2 right-2
              rounded-full bg-white/80 border border-purple-700 p-1 shadow-md transition
              hover:bg-purple-500 hover:text-white
              active:scale-[0.97]
            "
            aria-label="Remove image"
          >
            <IoMdCloseCircleOutline className="text-2xl text-purple-700 hover:text-white" />
          </button>
        </div>
      </div>
    ));

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 w-full max-w-md rounded-2xl bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 p-8 shadow-2xl border border-purple-800"
    >
      <h2 className="mb-8 text-center text-2xl font-bold text-purple-300 tracking-tight">
        ویرایش برند
      </h2>

      <label className="block mb-4">
        <span className="text-purple-200 font-medium">عنوان برند</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
          className="mt-2 w-full rounded-lg border border-purple-800 bg-slate-900 text-purple-100 px-4 py-2 focus:border-purple-400 focus:ring focus:ring-purple-700/60 outline-none transition"
        />
      </label>

      <label className="block mb-4">
        <span className="text-purple-200 font-medium">تصویر برند</span>
        <div className="mt-2 flex items-center space-x-2">
          <label className="relative flex flex-col items-center justify-center px-4 py-6 bg-purple-800/70 hover:bg-purple-700/80 rounded-xl border border-purple-700 cursor-pointer shadow group">
            <FaCloudUploadAlt className="text-4xl text-purple-300 group-hover:text-purple-100 transition" />
            <span className="mt-2 text-xs text-purple-100">
              انتخاب عکس جدید...
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={loading}
              onChange={(e) => {
                const activeImage = img.find((i) => !i.remove);

                if (activeImage) {
                  notify("error", "ابتدا عکس قبلی را حذف کنید");
                  return;
                }

                if (!e.target.files.length) return;

                setImg([
                  {
                    id: Date.now(),
                    local: true,
                    remove: false,
                    data: e.target.files[0],
                  },
                ]);
              }}
            />
          </label>
        </div>
        {items.length > 0 && <div className="mt-4">{items}</div>}
      </label>

      <label className="flex items-center mb-5 mt-1">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={() => setIsPublished(!isPublished)}
          disabled={loading}
          className="accent-purple-600 h-5 w-5 rounded focus:ring-purple-400 border border-purple-400 bg-slate-800"
        />
        <span className="ml-2 text-purple-200 font-semibold">
          برند فعال باشد
        </span>
        {isPublished && (
          <FaCheckCircle className="ml-2 text-purple-400 text-xl" />
        )}
      </label>

      <button
        type="submit"
        disabled={loading || title.trim().length === 0}
        className={`
          w-full py-3 mt-2 rounded-xl
          bg-gradient-to-r from-purple-700 to-purple-900
          text-purple-100 font-bold tracking-wide text-lg
          shadow transition
          ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-purple-950 hover:text-white"
          }
        `}
      >
        {loading ? "در حال ذخیره..." : "ذخیره تغییرات برند"}
      </button>
    </form>
  );
}
