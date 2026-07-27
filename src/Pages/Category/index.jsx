import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Category() {
  const navigate = useNavigate();

  return (
    <div className="bg-purple-950/40 p-6 rounded-xl border border-purple-800 shadow-md">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-purple-100">
          Categories
        </h2>

        <button
          onClick={() => navigate("/dashboard/category/create")}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition shadow"
        >
          Create New Category
        </button>
      </div>

      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800">
        <Outlet />
      </div>

    </div>
  );
}
