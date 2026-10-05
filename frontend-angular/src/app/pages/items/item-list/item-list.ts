import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ItemService } from "../../../core/services/item";
import { CategoryService } from "../../../core/services/category";
@Component({ selector: "app-item-list", standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: "./item-list.html", styleUrl: "./item-list.css" })
export class ItemList {
  private api = inject(ItemService);
  private cats = inject(CategoryService);
  items: any[] = [];
  categories: any[] = [];
  search = "";
  type = "";
  category_id = "";
  page = 1;
  limit = 9;
  error = "";
  loading = false;
  hasMore = false;
  ngOnInit() {
    this.cats.list().subscribe({ next: r => this.categories = r.categories, error: e => this.error = e.error.message });
    this.load();
  }
  load() {
    if (this.loading)
      return;
    this.loading = true;
    this.error = "";
    this.api.list({ search: this.search, type: this.type, category_id: this.category_id, page: this.page, limit: this.limit }).subscribe({
      next: r => { this.items = r.items; this.hasMore = r.hasMore; this.loading = false; },
      error: e => { this.error = e.error.message; this.loading = false; }
    });
  }
  filter() { if (!this.loading) {
    this.page = 1;
    this.load();
  } }
  reset() { if (!this.loading) {
    this.search = "";
    this.type = "";
    this.category_id = "";
    this.filter();
  } }
  next() { if (!this.loading && this.hasMore) {
    this.page++;
    this.load();
  } }
  prev() { if (!this.loading && this.page > 1) {
    this.page--;
    this.load();
  } }
}
