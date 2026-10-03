import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { adminGuard } from "./core/guards/admin.guard";
import { Home } from "./pages/home/home";
import { Login } from "./pages/auth/login/login";
import { Register } from "./pages/auth/register/register";
import { Verify } from "./pages/auth/verify/verify";
import { ForgotPassword } from "./pages/auth/forgot-password/forgot-password";
import { ResetPassword } from "./pages/auth/reset-password/reset-password";
import { ItemList } from "./pages/items/item-list/item-list";
import { ItemDetail } from "./pages/items/item-detail/item-detail";
import { ItemCreate } from "./pages/items/item-create/item-create";
import { ItemEdit } from "./pages/items/item-edit/item-edit";
import { MyClaims } from "./pages/claims/my-claims/my-claims";
import { Profile } from "./pages/profile/profile/profile";
import { Dashboard } from "./pages/admin/dashboard/dashboard";
import { Users } from "./pages/admin/users/users";
import { Categories } from "./pages/admin/categories/categories";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "login", component: Login },
  { path: "register", component: Register },
  { path: "verify", component: Verify },
  { path: "forgot-password", component: ForgotPassword },
  { path: "reset-password", component: ResetPassword },
  { path: "items", component: ItemList },
  { path: "items/create", component: ItemCreate, canActivate: [authGuard] },
  { path: "items/:id/edit", component: ItemEdit, canActivate: [authGuard] },
  { path: "items/:id", component: ItemDetail },
  { path: "claims", component: MyClaims, canActivate: [authGuard] },
  { path: "profile", component: Profile, canActivate: [authGuard] },
  {
    path: "admin",
    canActivate: [adminGuard],
    children: [
      { path: "", component: Dashboard },
      { path: "users", component: Users },
      { path: "categories", component: Categories },
    ],
  },
];
