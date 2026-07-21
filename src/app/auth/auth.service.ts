import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, catchError, of, map } from 'rxjs';

export type AuthCredentials = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  username: string;
};

type AccessResponse = {
  accessToken: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private accessTokenSignal = signal<string | null>(null);

  private userSignal = signal<AuthUser | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();

  readonly user = this.userSignal.asReadonly();

  readonly isLoggedIn = computed(() => !!this.accessTokenSignal());

  register(credentials: AuthCredentials): Observable<AuthUser> {
    return this.http.post<AuthUser>('/api/auth/register', {
      username: credentials.username.trim(),
      password: credentials.password,
    });
  }

  login(credentials: AuthCredentials): Observable<AccessResponse> {
    return this.http
      .post<AccessResponse>('/api/auth/login', {
        username: credentials.username.trim(),
        password: credentials.password,
      })
      .pipe(tap((res) => this.storeAccessToken(res.accessToken)));
  }

  refresh(): Observable<boolean> {
    return this.http.post<AccessResponse>('/api/auth/refresh', {}).pipe(
      tap((res) => this.storeAccessToken(res.accessToken)),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<unknown> {
    return this.http
      .post('/api/auth/logout', {}, { responseType: 'text' })
      .pipe(finalize(() => this.clearSession()));
  }

  me(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>('/api/auth/me')
      .pipe(tap((user) => this.userSignal.set(user)));
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
  }

  private storeAccessToken(accessToken: string): void {
    this.accessTokenSignal.set(accessToken);
  }
}
