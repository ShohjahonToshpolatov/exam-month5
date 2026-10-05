import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
@Component({
  selector: "app-verify",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./verify.html",
  styleUrl: "./verify.css",
})
export class Verify {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  email = this.route.snapshot.queryParamMap.get("email") || "";
  code = "";
  error = "";
  message = "";
  submit() {
    this.auth
      .verify({ email: this.email, code: this.code })
      .subscribe({
      next: () => this.router.navigateByUrl("/login"),
      error: (e) => (this.error = e?.error?.message || "Kod noto'g'ri"),
    });
  }
  resend() {
    this.auth
      .resendCode({ email: this.email })
      .subscribe({
      next: () => (this.message = "Yangi kod yuborildi"),
      error: (e) => (this.error = e?.error?.message || "Kod yuborilmadi"),
    });
  }
}
