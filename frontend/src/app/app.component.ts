import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LayoutService } from './core/services/layout.service';
import { ThemeService } from './core/services/theme.service';
import { ToasterComponent } from './shared/components/toaster.component';
import { SidebarComponent } from './shared/components/sidebar.component';
import { TopbarComponent } from './shared/components/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToasterComponent, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-brand-50 dark:bg-slate-950">
      <app-toaster />
      <ng-container *ngIf="!isAuthRoute(); else authLayout">
        <div class="min-h-screen p-4 lg:p-5">
          <div class="relative flex min-h-[calc(100vh-2rem)] gap-5">
            <div
              class="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition duration-300 lg:hidden"
              *ngIf="layoutService.mobileSidebarOpen()"
              (click)="layoutService.closeMobileSidebar()"
            ></div>

            <div
              class="fixed left-4 top-4 bottom-4 z-50 w-[250px] transition duration-300 lg:left-5 lg:top-5 lg:bottom-5 lg:translate-x-0"
              [class.w-[70px]]="layoutService.sidebarCollapsed()"
              [class.-translate-x-[110%]]="!layoutService.mobileSidebarOpen()"
              [class.translate-x-0]="layoutService.mobileSidebarOpen()"
            >
              <app-sidebar />
            </div>

            <div class="hidden lg:block" [style.width.px]="layoutService.sidebarCollapsed() ? 70 : 250"></div>

            <div class="min-w-0 flex-1 space-y-5 transition duration-300">
              <app-topbar />
              <main class="min-h-[calc(100vh-180px)]">
                <router-outlet />
              </main>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #authLayout>
        <router-outlet />
      </ng-template>
    </div>
  `
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  readonly layoutService = inject(LayoutService);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isAuthRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/login') || url.startsWith('/register');
  });

  constructor() {
    this.themeService.darkMode();
  }
}
