import React, { useState } from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'
import notify from '../../../Utils/Notify'
import FetchData from '../../../Utils/FetchData'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function CreateBrand() {
  const [title, setTitle] = useState('')
  const [isPublished, setIsPublishe] = useState(false)
  const [img, setImg] = useState()
  const [loading, setLoading] = useState()
  const navigate = useNavigate()
  const { token } = useSelector((state)=> state.auth)

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
          authorization: `bearer ${token}`
        },
        body: formData
      })
      const dataImg = await resImg.json()
      if (dataImg.success) {
        image = dataImg.data
      } else {
        notify('error', dataImg.message || 'upload failed, try again')
        return
      }
    }

    const result = await FetchData('brands', {
      method: 'POST',
      headers: {
        authorization: `bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        title, isPublished, image
      }),
    })
    console.log(result)
    if (result.success) {
      notify('success', result.message)
      navigate('/dashboard/brand')
    } else {
      notify('error', result.message)
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-purple-950/40 border border-purple-800 shadow-lg rounded-xl p-6 flex flex-col gap-5"
    >

      {/* Title */}
      <input
        type="text"
        name="title"
        placeholder="Write title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 rounded-lg bg-purple-900/40 border border-purple-700 text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      />

      {/* File Upload */}
      <input
        type="file"
        onChange={(e) => setImg(e.target.files[0])}
        accept="image/*"
        className="w-full text-purple-200 file:bg-purple-700 file:border-none file:px-4 file:py-2 file:rounded-lg file:text-white file:cursor-pointer"
      />

      {/* Image Preview */}
      {img && (
        <div className="relative w-40">
          <img
            src={URL.createObjectURL(img)}
            alt=""
            className="w-40 h-40 object-cover rounded-lg border border-purple-700"
          />
          <button
            type="button"
            onClick={() => setImg(null)}
            className="absolute -top-2 -right-2 bg-purple-700 rounded-full p-1 text-white hover:bg-purple-600 transition"
          >
            <IoMdCloseCircleOutline size={22} />
          </button>
        </div>
      )}

      {/* isPublished checkbox */}
      <label className="flex items-center gap-2 text-purple-200">
        <input
          type="checkbox"
          name="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublishe(e.target.checked)}
          className="w-4 h-4 accent-purple-600"
        />
        Published
      </label>

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className={`px-6 py-2 rounded-lg text-white shadow bg-purple-600 hover:bg-purple-500 transition 
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Creating...' : 'Create'}
      </button>

    </form>
  )
}
