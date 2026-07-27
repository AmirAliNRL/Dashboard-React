import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import SideBar from "../Components/SideBar";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Store/Slices/AuthSlice";

export default function Layout() {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch=useDispatch()

  if ((user?.role !== "admin" && user?.role !== "superAdmin") || !token) {
    dispatch(logout())
    return <Navigate to={"/"} />;
  }
  return (
    <div className="flex flex-col h-screen bg-purple-950">

      {/* Navbar */}
      <div className="px-4 pt-4">
        <div className="
          min-h-[70px]
          bg-purple-800
          text-white
          rounded-xl
          border-l border-r border-b border-purple-700
          shadow-xl
          flex items-center
          px-6
        ">
          <Navbar />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">

        {/* Sidebar */}
        <div className="w-42 bg-purple-800 text-white rounded-xl border border-purple-700 shadow-xl overflow-y-auto">
          <SideBar />
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-purple-800/80 backdrop-blur-sm rounded-xl border border-purple-700 shadow-xl p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
