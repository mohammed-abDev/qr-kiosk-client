import { Routes, Route } from "react-router";

import Home from "../pages/customer/Home";
import ProductDetails from "../pages/customer/ProductDetails";
import AdminRoutes from "./AdminRoutes";
import PageNotFound from "../components/common/PageNotFound"

function AppRoutes() {
  return (
    <Routes>
      {/* Customer */}
      <Route path="/" element={<Home />} />

      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Not Found */}
      <Route path="*" element={<PageNotFound/>} />
    </Routes>
  );
}

export default AppRoutes;
