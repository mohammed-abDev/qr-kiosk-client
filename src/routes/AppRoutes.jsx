import { Routes, Route } from "react-router";

import Home from "../pages/customer/Home";
import ProductDetails from "../pages/customer/ProductDetails";
import AdminRoutes from "./AdminRoutes";
import PageNotFound from "../components/common/PageNotFound"
import Categories from "../pages/Categories/Categories";
import CategoryProducts from "../pages/Categories/CategoriesProduct";
import More from "../pages/More/More";
import BannerManager from "../components/BannerManager/BannerManager";

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

      {/* categoris Products */}
      <Route path="/categories" element={<Categories />} />

      <Route path="/categories/:id" element={<CategoryProducts />} />

      {/* More */}
      <Route path="/more" element={<More />} />

      {/*Banner  */}
      <Route path="/admin/banners" element={<BannerManager />} />
    </Routes>
  );
}

export default AppRoutes;
