import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Slices/AuthSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-full flex items-center justify-between">

      {/* Left Side */}
      <h2 className="text-lg font-semibold tracking-wide">
        Admin Dashboard
      </h2>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* User Info */}
        <div className="text-right">
          <p className="text-sm text-purple-200">{user?.phonenumber}</p>
          <p className="text-xs text-purple-300">
            {user?.fullname || ""}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
          {user?.fullname?.charAt(0) || "A"}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => dispatch(logout())}
          className="px-4 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 transition shadow"
        >
          Logout
        </button>

      </div>
    </div>
  );
}
