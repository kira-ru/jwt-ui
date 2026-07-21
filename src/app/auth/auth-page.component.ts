import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { AuthService } from './auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<AuthMode>('login');
  submitting = signal(false);
  error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const credentials = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);

    const request$ =
      this.mode() === 'register'
        ? this.auth.register(credentials).pipe(switchMap(() => this.auth.login(credentials)))
        : this.auth.login(credentials);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.error.set(this.extractError(err));
      },
    });
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
      }
      if (typeof body === 'string' && body.trim()) {
        return body;
      }
      return err.statusText || 'Request failed';
    }
    return 'Something went wrong';
  }
}
