import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../services/auth";
import { environment } from "../../../environments/environment";
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem("token");
  const isApi = request.url.startsWith(environment.apiUrl + "/");
  const authRequest = token && isApi ? request.clone({ setHeaders: { Authorization: "Bearer " + token } }) : request;
  return next(authRequest).pipe(catchError(error => {
    if (error.status === 401 && token && isApi && !request.url.endsWith("/login")) {
      auth.logout();
      router.navigateByUrl("/login");
    }
    if (isApi) {
      const details = error.error?.errors?.map((entry: any) => entry.message).join(". ");
      const message = details || error.error?.message || "Serverga ulanib bo'lmadi. Qayta urinib ko'ring";
      return throwError(() => ({ ...error, error: { ...error.error, message } }));
    }
    return throwError(() => error);
  }));
};
