import { Routes, Route } from "react-router";

import Home from "../pages/customer/Home";
import ProductDetails from "../pages/customer/ProductDetails";
import AdminRoutes from "./AdminRoutes";
import PageNotFound from "../components/common/PageNotFound"
import Categories from "../pages/Categories/Categories";
import More from "../pages/More/More";

function AppRoutes() {
  return (
    <Routes>
      {/* Customer */}
      <Route path="/" element={<Home />} />

      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Not Found */}
      <Route path="*" element={<PageNotFound />} />

      {/* categoris */}
      <Route path="/categories" element={<Categories />} />
      
      {/* More */}
      <Route path="/more" element={<More />} />
    </Routes>
  );
}

export default AppRoutes;
