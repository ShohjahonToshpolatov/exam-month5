import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CategoryService } from "../../../core/services/category";
import { ItemService } from "../../../core/services/item";
@Component({
  selector: "app-item-create",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  loading = false;
  today = new Date().toLocaleDateString("en-CA");
  ngOnInit() {
    this.cats
      .list()
      .subscribe({ next: (r) => (this.categories = r.categories), error: e => this.error = e.error.message });
  }
  pick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.error = "";
    this.files = Array.from(input.files || []);
    if (this.files.length > 5 || this.files.some(file => file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      this.error = "Ko'pi bilan 5 ta JPG, PNG yoki WebP rasm. Har biri 2 MB dan oshmasin";
      this.files = [];
      input.value = "";
    }
  }
  submit() {
    if (this.loading)
      return;
    this.loading = true;
    this.error = "";
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
      error: (e) => { this.error = e.error.message; this.loading = false; },
    });
  }
}
