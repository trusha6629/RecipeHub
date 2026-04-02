import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let toastService: ToastService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AuthService,
        ToastService
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores the authenticated session after login', () => {
    let responseBody: unknown;

    service.login({ email: 'chef@recipehub.com', password: 'password123' }).subscribe((response) => {
      responseBody = response;
    });

    const request = httpMock.expectOne('http://localhost:5000/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush({
      message: 'Login successful.',
      token: 'jwt-token',
      user: {
        _id: 'user-1',
        name: 'Recipe Tester',
        email: 'chef@recipehub.com',
        followingCreators: ['creator-1']
      }
    });

    expect(responseBody).toBeTruthy();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('jwt-token');
    expect(service.currentUser()?.email).toBe('chef@recipehub.com');
    expect(JSON.parse(localStorage.getItem('recipehub_auth') || '{}').token).toBe('jwt-token');
  });

  it('clears the session and redirects on logout', () => {
    localStorage.setItem(
      'recipehub_auth',
      JSON.stringify({
        token: 'persisted-token',
        user: {
          _id: 'user-2',
          name: 'Persisted User',
          email: 'persisted@recipehub.com',
          followingCreators: []
        }
      })
    );

    service = TestBed.inject(AuthService);

    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const toastSpy = jest.spyOn(toastService, 'info');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('recipehub_auth')).toBeNull();
    expect(toastSpy).toHaveBeenCalledWith('You have been signed out.');
    expect(routerSpy).toHaveBeenCalledWith('/login');
  });
});
