import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../auth/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loggingOut = signal(false);

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load profile. Please sign in again.');
        this.auth.logout().subscribe({
          next: () => void this.router.navigateByUrl('/auth'),
          error: () => void this.router.navigateByUrl('/auth'),
        });
      },
    });
  }

  logout(): void {
    if (this.loggingOut()) {
      return;
    }
    this.loggingOut.set(true);
    this.auth.logout().subscribe({
      next: () => {
        this.loggingOut.set(false);
        void this.router.navigateByUrl('/auth');
      },
      error: () => {
        this.loggingOut.set(false);
        void this.router.navigateByUrl('/auth');
      },
    });
  }
}
