import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
@Injectable({providedIn:"root"})
export class CategoryService { private http=inject(HttpClient); private api=`${environment.apiUrl}/categories`; list(){return this.http.get<any>(this.api)} create(data:unknown){return this.http.post<any>(this.api,data)} update(id:number|string,data:unknown){return this.http.put<any>(`${this.api}/${id}`,data)} delete(id:number|string){return this.http.delete<any>(`${this.api}/${id}`)} }
