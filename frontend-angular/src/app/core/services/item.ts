import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
@Injectable({ providedIn: "root" })
export class ItemService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + "/items";
  list(query: Record<string, string | number> = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (String(value) !== "")
        params = params.set(key, String(value));
    }
    return this.http.get<any>(this.api, { params });
  }
  get(id: number | string) { return this.http.get<any>(this.api + "/" + id); }
  my() { return this.http.get<any>(this.api + "/my"); }
  create(data: FormData) { return this.http.post<any>(this.api, data); }
  update(id: number | string, data: unknown) { return this.http.patch<any>(this.api + "/" + id, data); }
  close(id: number | string) { return this.http.patch<any>(this.api + "/" + id + "/close", {}); }
}
