import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
export const adminGuard: CanActivateFn = () => {
  try { const user = JSON.parse(localStorage.getItem("user") || "null"); return user?.role === "admin" ? true : inject(Router).createUrlTree(["/items"]); }
  catch { return inject(Router).createUrlTree(["/items"]); }
};
