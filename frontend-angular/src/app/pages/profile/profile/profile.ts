import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth";
import { ItemService } from "../../../core/services/item";
@Component({ selector: "app-profile", standalone: true, imports: [CommonModule, RouterLink], templateUrl: "./profile.html", styleUrl: "./profile.css" })
export class Profile {
  private auth = inject(AuthService);
  private items = inject(ItemService);
  private router = inject(Router);
  user: any;
  myItems: any[] = [];
  error = "";
  loading = true;
  ngOnInit() {
    this.user = this.auth.getUser();
    this.auth.me().subscribe({ next: (r: any) => { this.user = r.user; this.auth.saveSession(r); }, error: e => this.error = e.error.message });
    this.items.my().subscribe({ next: r => { this.myItems = r.items; this.loading = false; }, error: e => { this.error = e.error.message; this.loading = false; } });
  }
  logout() { this.auth.logout(); this.router.navigateByUrl("/login"); }
}
