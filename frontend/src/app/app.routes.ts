import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AnalyticsComponent } from './features/recipes/analytics.component';
import { CreatorProfileComponent } from './features/recipes/creator-profile.component';
import { FavoritesComponent } from './features/recipes/favorites.component';
import { FollowingUpdatesComponent } from './features/recipes/following-updates.component';
import { HomeComponent } from './features/recipes/home.component';
import { RecipeDetailComponent } from './features/recipes/recipe-detail.component';
import { RecipeFormComponent } from './features/recipes/recipe-form.component';
import { SettingsComponent } from './features/recipes/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipes', component: HomeComponent },
  { path: 'creators/:creatorId', component: CreatorProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: 'reviews', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent },
  { path: 'updates', component: FollowingUpdatesComponent, canActivate: [authGuard] },
  { path: 'recipes/new', component: RecipeFormComponent, canActivate: [authGuard], canDeactivate: [pendingChangesGuard] },
  { path: 'recipes/:id/edit', component: RecipeFormComponent, canActivate: [authGuard], canDeactivate: [pendingChangesGuard] },
  { path: 'recipes/:id', component: RecipeDetailComponent },
  { path: '**', redirectTo: '' }
];
