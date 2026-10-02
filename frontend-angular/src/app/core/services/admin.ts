import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
@Injectable({providedIn:"root"})
export class AdminService { private http=inject(HttpClient); private api=`${environment.apiUrl}/admin`; stats(){return this.http.get<any>(`${this.api}/stats`)} }
