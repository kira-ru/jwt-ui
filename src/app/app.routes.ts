import { Routes } from '@angular/router';
import { AuthPageComponent } from './auth/auth-page.component';
import { HomePageComponent } from './home/home-page.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthPageComponent },
  { path: '', component: HomePageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
