import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { CategoryService } from "../../../core/services/category";
import { ItemService } from "../../../core/services/item";

@Component({
  selector: "app-item-create",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./item-create.html",
  styleUrl: "./item-create.css",
})
export class ItemCreate {
  private api = inject(ItemService);
  private cats = inject(CategoryService);
  private router = inject(Router);
  categories: any[] = [];
  type = "lost";
  title = "";
  description = "";
  location = "";
  category_id = "";
  event_date = "";
  secret_question = "";
  secret_answer = "";
  files: File[] = [];
  error = "";

  ngOnInit() {
    this.cats
      .list()
      .subscribe({ next: (r) => (this.categories = r?.categories || r || []) });
  }

  pick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.files = Array.from(input.files || []).slice(0, 3);
  }

  submit() {
    const data = new FormData();
    data.append("type", this.type);
    data.append("title", this.title);
    data.append("description", this.description);
    data.append("location", this.location);
    data.append("category_id", this.category_id);
    data.append("event_date", this.event_date);
    if (this.type === "found") {
      data.append("secret_question", this.secret_question);
      data.append("secret_answer", this.secret_answer);
    }
    this.files.forEach((file) => data.append("images", file));
    this.api.create(data).subscribe({
      next: (r) => this.router.navigate(["/items", r?.item?.id || r?.id]),
      error: (e) => (this.error = e?.error?.message || "E'lon yaratilmadi"),
    });
  }
}
