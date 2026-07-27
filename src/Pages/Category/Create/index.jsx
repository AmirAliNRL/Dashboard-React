import React, { useEffect, useState } from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'
import notify from '../../../Utils/Notify'
import FetchData from '../../../Utils/FetchData'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function CreateCategory() {
  const [title, setTitle] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [img, setImg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [supCategoryId, setSupCategoryId] = useState('')
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await FetchData('categories?limit=1000', {
        method: 'GET',
        headers: {
          authorization: `bearer ${token}`,
        },
      })

      if (result.success) {
        setCategories(result.data || [])
      }
    }

    fetchCategories()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let image = ''

    if (img) {
      const formData = new FormData()
      formData.append('file', img)

      const resImg = await fetch(import.meta.env.VITE_BASE_URL + 'upload', {
        method: 'POST',
        headers: {
          authorization: `bearer ${token}`,
        },
        body: formData,
      })

      const dataImg = await resImg.json()

      if (dataImg.success) {
        image = dataImg.data
      } else {
        notify('error', dataImg.message || 'آپلود تصویر ناموفق بود')
        setLoading(false)
        return
      }
    }

    const result = await FetchData('categories', {
      method: 'POST',
      headers: {
        authorization: `bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title,
        isPublished,
        image,
        supCategoryId: supCategoryId || null,
      }),
    })

    if (result.success) {
      notify('success', result.message)
      navigate('/dashboard/category')
    } else {
      notify('error', result.message)
    }

    setLoading(false)
  }

  const activeImage = img

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-2xl border border-purple-800 bg-purple-950/40 p-6 shadow-lg backdrop-blur-md flex flex-col gap-5"
    >
      <h2 className="text-center text-2xl font-bold text-purple-200">
        ایجاد دسته‌بندی جدید
      </h2>

      {/* عنوان */}
      <div>
        <label className="mb-2 block text-sm font-medium text-purple-200">
          عنوان دسته‌بندی
        </label>
        <input
          type="text"
          name="title"
          placeholder="مثلاً: پوشاک مردانه"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-purple-700 bg-purple-900/40 p-3 text-purple-100 placeholder-purple-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
        />
      </div>

      {/* دسته والد */}
      <div>
        <label className="mb-2 block text-sm font-medium text-purple-200">
          دسته والد
        </label>
        <select
          value={supCategoryId}
          onChange={(e) => setSupCategoryId(e.target.value)}
          className="w-full rounded-xl border border-purple-700 bg-purple-900/40 p-3 text-purple-100 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
        >
          <option value="">بدون دسته والد</option>
          {categories.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      {/* آپلود تصویر */}
      <div>
        <label className="mb-2 block text-sm font-medium text-purple-200">
          تصویر دسته‌بندی
        </label>

        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 transition
          ${
            activeImage
              ? 'border-red-500 bg-red-500/10'
              : 'border-purple-700 bg-purple-900/30 hover:bg-purple-900/50'
          }`}
        >
          <span className="text-sm text-purple-200">
            {activeImage ? 'برای تغییر تصویر، ابتدا تصویر قبلی را حذف کنید' : 'برای انتخاب تصویر کلیک کنید'}
          </span>

          <input
            type="file"
            hidden
            accept="image/*"
            disabled={loading}
            onChange={(e) => {
              if (img) {
                notify('error', 'ابتدا تصویر قبلی را حذف کنید')
                return
              }

              if (!e.target.files.length) return

              setImg(e.target.files[0])
            }}
          />
        </label>

        {img && (
          <div className="relative mt-4 w-44 overflow-hidden rounded-xl border border-purple-700">
            <img
              src={URL.createObjectURL(img)}
              alt="preview"
              className="h-44 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setImg(null)}
              className="absolute right-2 top-2 rounded-full bg-purple-700 p-1 text-white shadow hover:bg-purple-600"
            >
              <IoMdCloseCircleOutline size={22} />
            </button>
          </div>
        )}
      </div>

      {/* published */}
      <label className="flex items-center gap-2 text-purple-200">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 accent-purple-600"
        />
        منتشر شود
      </label>

      {/* submit */}
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className={`rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-purple-500 ${
          loading || !title.trim() ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {loading ? 'در حال ایجاد...' : 'ایجاد دسته‌بندی'}
      </button>
    </form>
  )
}
