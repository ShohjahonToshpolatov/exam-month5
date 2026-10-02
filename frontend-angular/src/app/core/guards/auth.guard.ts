import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
export const authGuard: CanActivateFn = () => localStorage.getItem("token") ? true : inject(Router).createUrlTree(["/login"]);
