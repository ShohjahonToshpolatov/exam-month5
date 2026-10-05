import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "./core/services/auth";
@Component({ selector: "app-root", standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule], templateUrl: "./app.component.html" })
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  menuOpen = false;
  get loggedIn() { return !!localStorage.getItem("token"); }
  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
        window.scrollTo(0, 0);
      }
    });
  }
}
