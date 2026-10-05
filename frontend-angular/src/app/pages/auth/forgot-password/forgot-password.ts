import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
@Component({ selector: "app-forgot", standalone: true, imports: [FormsModule, RouterLink], templateUrl: "./forgot-password.html", styleUrl: "./forgot-password.css" })
export class ForgotPassword {
  private auth = inject(AuthService);
  email = "";
  error = "";
  message = "";
  submit() { this.auth.forgotPassword({ email: this.email }).subscribe({ next: () => this.message = "Tiklash kodi yuborildi", error: e => this.error = e?.error?.message || "Xatolik" }); }
}
