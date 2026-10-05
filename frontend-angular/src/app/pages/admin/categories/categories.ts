import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CategoryService } from "../../../core/services/category";
@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./categories.html",
  styleUrl: "./categories.css",
})
export class Categories {
  private api = inject(CategoryService);
  categories: any[] = [];
  name = "";
  error = "";
  editingId = 0;
  editName = "";
  load() {
    this.error = "";
    this.api
      .list()
      .subscribe({
      next: (r) => (this.categories = r?.categories || r || []),
      error: (e) => (this.error = e?.error?.message || "Kategoriyalar yuklanmadi"),
    });
  }
  ngOnInit() {
    this.load();
  }
  create() {
    if (!this.name.trim())
      return;
    this.api.create({ name: this.name.trim() }).subscribe({
      next: () => {
        this.name = "";
        this.load();
      },
      error: (e) => (this.error = e?.error?.message || "Kategoriya yaratilmadi"),
    });
  }
  edit(category: any) {
    this.editingId = category.id;
    this.editName = category.name;
  }
  save() {
    if (!this.editName.trim())
      return;
    this.api.update(this.editingId, { name: this.editName.trim() }).subscribe({
      next: () => { this.editingId = 0; this.load(); },
      error: e => this.error = e.error.message
    });
  }
  remove(id: number) {
    if (confirm("Kategoriyani ochirishni tasdiqlaysizmi?"))
      this.api
        .delete(id)
        .subscribe({
        next: () => this.load(),
        error: (e) => (this.error = e?.error?.message || "Kategoriya ochirilmadi"),
      });
  }
}
