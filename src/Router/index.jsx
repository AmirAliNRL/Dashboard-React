import { createBrowserRouter } from "react-router-dom";
import Auth from "../Pages/Auth";
import Layout from "../Layout";

// Dashboard Pages
import Home from "../Pages/Home";

// Brand Pages
import Brands from "../Pages/Brand";
import GetAllBrand from "../Pages/Brand/GetAll";
import CreateBrand from "../Pages/Brand/Create";
import UpdateBrand from "../Pages/Brand/Update";

// Product Pages
import Product from "../Pages/Product";
import GetAllProduct from "../Pages/Product/GetAll";
import CreateProduct from "../Pages/Product/Create";
import UpdateProduct from "../Pages/Product/Update";

// User Pages
import Users from "../Pages/User";
import GetAllUser from "../Pages/User/GetAll";
import UpdateUser from "../Pages/User/Update";

// Category Pages
import Category from "../Pages/Category";
import GetAllCategory from "../Pages/Category/GetAll";
import CreateCategory from "../Pages/Category/Create";
import UpdateCategory from "../Pages/Category/Update";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      // Category Routes
      {
        path: "category",
        element: <Category />,
        children: [
          {
            index: true,
            element: <GetAllCategory />,
          },
          {
            path: "create",
            element: <CreateCategory />,
          },
          {
            path: "update/:id",
            element: <UpdateCategory />,
          },
        ],
      },
  // Brand Routes
  {
    path: "brand",
    element: <Brands />,
    children: [
      {
        index: true,
        element: <GetAllBrand />,
      },
      {
        path: "create",
        element: <CreateBrand />,
      },
      {
        path: "update/:id",
        element: <UpdateBrand />,
      },
    ],
  },

  // Product Routes
  {
    path: "product",
    element: <Product />,
    children: [
      {
        index: true,
        element: <GetAllProduct />,
      },
      {
        path: "create",
        element: <CreateProduct />,
      },
      {
        path: "update/:id",
        element: <UpdateProduct />,
      },
    ],
  },

  // User Routes
  {
    path: "user",
    element: <Users />,
    children: [
      {
        index: true,
        element: <GetAllUser />,
      },
      {
        path: "update/:id",
        element: <UpdateUser />,
      },
    ],
  },
]}
]);

export default router;
