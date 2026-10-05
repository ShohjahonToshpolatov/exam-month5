import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ClaimService } from "../../../core/services/claim";
@Component({ selector: "app-my-claims", standalone: true, imports: [CommonModule, RouterLink], templateUrl: "./my-claims.html", styleUrl: "./my-claims.css" })
export class MyClaims {
  private api = inject(ClaimService);
  claims: any[] = [];
  error = "";
  loading = true;
  ngOnInit() {
    this.api.mine().subscribe({ next: r => { this.claims = r.claims; this.loading = false; }, error: e => { this.error = e.error.message; this.loading = false; } });
  }
}
