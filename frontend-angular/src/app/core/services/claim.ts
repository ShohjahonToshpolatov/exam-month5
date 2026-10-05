import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
@Injectable({ providedIn: "root" })
export class ClaimService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  create(itemId: number | string, data: unknown) {
    return this.http.post<any>(`${this.api}/claims/item/${itemId}`, data);
  }
  forItem(itemId: number | string) {
    return this.http.get<any>(`${this.api}/claims/item/${itemId}`);
  }
  mine() {
    return this.http.get<any>(`${this.api}/claims/my`);
  }
  approve(id: number | string) {
    return this.http.patch<any>(`${this.api}/claims/${id}`, {
      status: "accepted",
    });
  }
  reject(id: number | string) {
    return this.http.patch<any>(`${this.api}/claims/${id}`, {
      status: "rejected",
    });
  }
}
