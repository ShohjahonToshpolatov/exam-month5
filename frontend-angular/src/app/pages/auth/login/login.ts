import {Component,inject} from "@angular/core";import {FormsModule} from "@angular/forms";import {Router,RouterLink} from "@angular/router";import {AuthService} from "../../../core/services/auth";
@Component({selector:"app-login",standalone:true,imports:[FormsModule,RouterLink],templateUrl:"./login.html",styleUrl:"./login.css"})
export class Login{private auth=inject(AuthService);private router=inject(Router);email="";password="";error="";loading=false;
submit(){this.error="";this.loading=true;this.auth.login({email:this.email,password:this.password}).subscribe({next:r=>{this.auth.saveSession(r);this.router.navigateByUrl("/items")},error:e=>{this.error=e?.error?.message||"Login xatosi";this.loading=false}})}}
