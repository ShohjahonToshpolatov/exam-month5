import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auth`;
  register(data: unknown) {
    return this.http.post(`${this.api}/register`, data);
  }
  verify(data: unknown) {
    return this.http.post(`${this.api}/verify`, data);
  }
  resendCode(data: unknown) {
    return this.http.post(`${this.api}/resend-code`, data);
  }
  login(data: unknown) {
    return this.http.post<any>(`${this.api}/login`, data);
  }
  forgotPassword(data: unknown) {
    return this.http.post(`${this.api}/forgot-password`, data);
  }
  resetPassword(data: unknown) {
    return this.http.post(`${this.api}/reset-password`, data);
  }
  me() {
    return this.http.get(`${this.api}/me`);
  }
  saveSession(response: any) {
    if (response?.token) localStorage.setItem("token", response.token);
    if (response?.user)
      localStorage.setItem("user", JSON.stringify(response.user));
  }
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
