import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import useFormFields from "../../Hooks/useFormFields";
import FetchData from "../../Utils/FetchData";
import notify from "../../Utils/Notify";
import { login } from "../../Store/Slices/AuthSlice";

export default function Auth() {
  const { token } = useSelector((state) => state.auth);
  const navigate =useNavigate()
  const [fields, handlechange, setfields] = useFormFields({
    phoneNumber: "",
    password: "",
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to={"/dashboard"} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await FetchData("auth/login-password", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(fields),
    });

    if (
      result.success &&
      (result.data?.user.role == "admin" || result.data?.user.role == "superAdmin")
    ) {
      dispatch(login(result.data));
      notify("success", result.message);
      navigate('/dashboard')
    } else {
      if (result?.data?.user?.role == "admin" || result?.data?.user?.role == "superAdmin") {
        result.message =
          "you don't have permission to enter dashboard, please contact SuperAdmin";
      }

      setfields({
        phoneNumber: "",
        password: "",
      });

      notify("error", result.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl"
      >
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-8">
          Admin Dashboard Login
        </h2>

        <div className="flex flex-col gap-5">
          <input
            type="text"
            name="phoneNumber"
            placeholder="Enter Your phone number"
            value={fields.phoneNumber}
            onChange={handlechange}
            className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Your password"
            value={fields.password}
            onChange={handlechange}
            className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />

          <button
            disabled={loading}
            type="submit"
            className="py-3 mt-2 text-white font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
