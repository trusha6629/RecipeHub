import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { RecipeService } from './recipe.service';
import { UpdatesService } from './updates.service';

describe('UpdatesService', () => {
  let service: UpdatesService;
  let recipeService: { getFollowingHighlights: jest.Mock };

  beforeEach(() => {
    localStorage.clear();

    recipeService = {
      getFollowingHighlights: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        UpdatesService,
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            currentUser: () => ({
              _id: 'user-1',
              name: 'Recipe Tester',
              email: 'tester@recipehub.com',
              followingCreators: []
            })
          }
        },
        {
          provide: RecipeService,
          useValue: recipeService
        }
      ]
    });

    service = TestBed.inject(UpdatesService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('counts only unread highlight recipes after the last viewed time', () => {
    localStorage.setItem('recipehub_updates_last_viewed_user-1', '2026-03-01T10:00:00.000Z');
    recipeService.getFollowingHighlights.mockReturnValue(
      of({
        highlights: [
          {
            _id: 'recipe-1',
            createdAt: '2026-03-02T10:00:00.000Z'
          },
          {
            _id: 'recipe-2',
            createdAt: '2026-02-28T10:00:00.000Z'
          }
        ]
      })
    );

    service.refreshUnreadCount()?.subscribe();

    expect(recipeService.getFollowingHighlights).toHaveBeenCalled();
    expect(service.unreadCount()).toBe(1);
  });

  it('marks highlights as viewed and resets the unread count', () => {
    service.clear();
    recipeService.getFollowingHighlights.mockReturnValue(of({ highlights: [] }));

    service.markViewed();

    expect(service.unreadCount()).toBe(0);
    expect(localStorage.getItem('recipehub_updates_last_viewed_user-1')).toBeTruthy();
    expect(service.lastViewedAt()).toBeTruthy();
  });
});
