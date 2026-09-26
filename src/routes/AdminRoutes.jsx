import { Routes, Route } from "react-router";

import AdminPage from "../pages/admin/AdminPage";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";
import CategoryManager from "../pages/admin/CategoryManager";
import ShopSettings from "../pages/admin/ShopSetting";
import ProtectedRoute from "./ProtectedRoute";
import PageNotFound from "../components/common/PageNotFound";
import PaymentMethods from "../pages/admin/PaymentMethods";

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminPage />} />

      <Route
        path="products/add"
        element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="products/:id/edit"
        element={
          <ProtectedRoute>
            <EditProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="categories"
        element={
          <ProtectedRoute>
            <CategoryManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="shop"
        element={
          <ProtectedRoute>
            <ShopSettings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<PageNotFound />} />
      <Route path="payment-methods" element={<PaymentMethods />} />
    </Routes>
  );
}

export default AdminRoutes;
