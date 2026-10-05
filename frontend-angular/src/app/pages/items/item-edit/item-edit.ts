import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ItemService } from "../../../core/services/item";
import { CategoryService } from "../../../core/services/category";
import { AuthService } from "../../../core/services/auth";
@Component({ selector: "app-item-edit", standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: "./item-edit.html", styleUrl: "./item-edit.css" })
export class ItemEdit {
  private route = inject(ActivatedRoute);
  private api = inject(ItemService);
  private cats = inject(CategoryService);
  private auth = inject(AuthService);
  private router = inject(Router);
  id = "";
  categories: any[] = [];
  title = "";
  description = "";
  location = "";
  category_id = "";
  status = "";
  error = "";
  loading = false;
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id") || "";
    this.cats.list().subscribe({ next: r => this.categories = r.categories, error: e => this.error = e.error.message });
    this.api.get(this.id).subscribe({
      next: r => {
        const item = r.item;
        if (item.user_id !== this.auth.getUser()?.id) {
          this.router.navigate(["/items", this.id]);
          return;
        }
        this.title = item.title;
        this.description = item.description;
        this.location = item.location;
        this.category_id = item.category_id;
        this.status = item.status;
        if (item.status !== "active")
          this.error = "Yopilgan e'lonni tahrirlab bo'lmaydi";
      },
      error: e => this.error = e.error.message
    });
  }
  submit() {
    if (this.loading || this.status !== "active")
      return;
    this.loading = true;
    this.error = "";
    this.api.update(this.id, { title: this.title, description: this.description, location: this.location, category_id: this.category_id }).subscribe({
      next: () => this.router.navigate(["/items", this.id]),
      error: e => { this.error = e.error.message; this.loading = false; }
    });
  }
}
