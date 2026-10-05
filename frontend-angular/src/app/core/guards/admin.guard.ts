import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { map, catchError, of } from "rxjs";
import { AuthService } from "../services/auth";
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!localStorage.getItem("token"))
    return router.createUrlTree(["/login"]);
  return auth.me().pipe(map((response: any) => {
    auth.saveSession(response);
    return response.user?.role === "admin" ? true : router.createUrlTree(["/items"]);
  }), catchError(() => of(router.createUrlTree(["/items"]))));
};
