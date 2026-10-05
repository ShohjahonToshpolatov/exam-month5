import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
@Injectable({ providedIn: "root" })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + "/admin";
  stats() { return this.http.get<any>(this.api + "/stats"); }
  users(search: string, page: number) { return this.http.get<any>(this.api + "/users", { params: { search, page, limit: 10 } }); }
  role(id: number, role: string) { return this.http.patch<any>(this.api + "/users/" + id + "/role", { role }); }
  remove(id: number) { return this.http.delete<any>(this.api + "/users/" + id); }
}
