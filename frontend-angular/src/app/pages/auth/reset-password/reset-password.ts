import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
@Component({ selector: "app-reset", standalone: true, imports: [FormsModule, RouterLink], templateUrl: "./reset-password.html", styleUrl: "./reset-password.css" })
export class ResetPassword {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = inject(ActivatedRoute).snapshot.queryParamMap.get("email") || "";
  code = "";
  newPassword = "";
  error = "";
  submit() { this.auth.resetPassword({ email: this.email, code: this.code, newPassword: this.newPassword }).subscribe({ next: () => this.router.navigateByUrl("/login"), error: e => this.error = e?.error?.message || "Parol tiklanmadi" }); }
}
