import React from "react";
import { Link } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { FaTags } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { MdInventory2 } from "react-icons/md";
import { FaUsers } from "react-icons/fa";

export default function SideBar() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition"
      >
        <MdDashboard size={20} />
        Home
      </Link>

      <Link
        to="category"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition"
      >
        <BiCategory size={20} />
        Category
      </Link>

      <Link
        to="brand"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition"
      >
        <FaTags size={18} />
        Brand
      </Link>

      <Link
        to="product"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition"
      >
        <MdInventory2 size={20} />
        Product
      </Link>

      <Link
        to="user"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition"
      >
        <FaUsers size={20} />
        User
      </Link>
    </div>
  );
}
