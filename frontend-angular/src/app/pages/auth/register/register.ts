import {Component,inject} from "@angular/core";import {FormsModule} from "@angular/forms";import {Router,RouterLink} from "@angular/router";import {AuthService} from "../../../core/services/auth";
@Component({selector:"app-register",standalone:true,imports:[FormsModule,RouterLink],templateUrl:"./register.html",styleUrl:"./register.css"})
export class Register{private auth=inject(AuthService);private router=inject(Router);full_name="";email="";phone="";password="";error="";
submit(){this.error="";this.auth.register({full_name:this.full_name,email:this.email,phone:this.phone,password:this.password}).subscribe({next:()=>this.router.navigate(["/verify"],{queryParams:{email:this.email}}),error:e=>this.error=e?.error?.message||"Ro'yxatdan o'tishda xatolik"})}}
