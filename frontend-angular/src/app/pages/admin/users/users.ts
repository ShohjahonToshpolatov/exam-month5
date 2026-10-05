import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../../core/services/admin";
import { AuthService } from "../../../core/services/auth";
@Component({ selector: "app-users", standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./users.html", styleUrl: "./users.css" })
export class Users {
  private api = inject(AdminService);
  currentId = inject(AuthService).getUser()?.id;
  users: any[] = [];
  search = "";
  page = 1;
  error = "";
  loading = false;
  ngOnInit() { this.load(); }
  load() {
    this.error = "";
    this.loading = true;
    this.api.users(this.search, this.page).subscribe({ next: r => { this.users = r.users; this.loading = false; }, error: e => { this.error = e.error.message; this.loading = false; } });
  }
  filter() { this.page = 1; this.load(); }
  changeRole(user: any) {
    this.api.role(user.id, user.role === "admin" ? "user" : "admin").subscribe({ next: () => this.load(), error: e => this.error = e.error.message });
  }
  remove(user: any) {
    if (!confirm(user.full_name + " va unga tegishli e'lonlarni o'chirasizmi?"))
      return;
    this.api.remove(user.id).subscribe({ next: () => this.load(), error: e => this.error = e.error.message });
  }
  next() { if (!this.loading && this.users.length === 10) {
    this.page++;
    this.load();
  } }
  prev() { if (!this.loading && this.page > 1) {
    this.page--;
    this.load();
  } }
}
