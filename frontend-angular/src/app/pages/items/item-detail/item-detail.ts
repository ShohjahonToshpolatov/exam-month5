import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ItemService } from "../../../core/services/item";
import { ClaimService } from "../../../core/services/claim";

@Component({
  selector: "app-item-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./item-detail.html",
  styleUrl: "./item-detail.css",
})
export class ItemDetail {
  private route = inject(ActivatedRoute);
  private api = inject(ItemService);
  private claims = inject(ClaimService);
  private router = inject(Router);

  item: any;
  claimList: any[] = [];
  answer = "";
  message = "";
  reportMessage = "";
  error = "";
  success = "";

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.api.get(id).subscribe({
        next: (r: any) => {
          this.item = r?.item || r;
          this.loadClaims();
        },
        error: (e: any) =>
          (this.error = e?.error?.message || "E'lon topilmadi"),
      });
    }
  }

  loadClaims() {
    if (this.item?.id) {
      this.claims.forItem(this.item.id).subscribe({
        next: (r: any) => (this.claimList = r?.claims || r || []),
        error: () => {
          this.claimList = [];
        },
      });
    }
  }

  submitClaim() {
    this.error = "";
    this.success = "";
    this.claims
      .create(this.item.id, { answer: this.answer, message: this.message })
      .subscribe({
        next: () => {
          this.success = "Da'vo yuborildi";
          this.answer = "";
          this.message = "";
          this.loadClaims();
        },
        error: (e: any) =>
          (this.error = e?.error?.message || "Da'vo yuborilmadi"),
      });
  }

  approve(id: number) {
    this.claims.approve(id).subscribe({
      next: () => this.loadClaims(),
      error: (e: any) => (this.error = e?.error?.message || "Tasdiqlanmadi"),
    });
  }

  reject(id: number) {
    this.claims.reject(id).subscribe({
      next: () => this.loadClaims(),
      error: (e: any) => (this.error = e?.error?.message || "Rad etilmadi"),
    });
  }

  report() {
    this.error = "";
    this.success = "";

    if (!this.reportMessage.trim()) {
      this.error = "Iltimos, xabar matnini kiriting";
      return;
    }

    // Backenddagi claims create endpointiga lost e'lon uchun xabar yuboramiz
    this.claims
      .create(this.item.id, {
        answer: "Men topdim",
        message: this.reportMessage,
      })
      .subscribe({
        next: () => {
          this.success = "Xabaringiz muvaffaqiyatli yuborildi!";
          this.reportMessage = "";
          this.loadClaims();
        },
        error: (e: any) =>
          (this.error = e?.error?.message || "Xabar yuborilmadi"),
      });
  }

  close() {
    this.api.update(this.item.id, { status: "closed" }).subscribe({
      next: () => this.router.navigateByUrl("/items"),
      error: (e: any) => (this.error = e?.error?.message || "Yopilmadi"),
    });
  }
}
