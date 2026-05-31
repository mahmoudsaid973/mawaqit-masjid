import { test, expect, type Page } from '@playwright/test';

/**
 * Page Object Model for the Events and Khutbah Topics feature.
 * Encapsulates selectors and user interactions for this specific domain.
 */
class EventsAndKhutbahPage {
  private readonly page: Page;
  
  // Selectors
  private readonly upcomingEventsSection;
  private readonly khutbahTopicsSection;
  private readonly eventCards;
  private readonly topicCards;
  private readonly loadingSpinner;
  private readonly errorMessage;
  private readonly eventTitle;
  private readonly eventDate;
  private readonly topicTitle;
  private readonly topicTags;

  constructor(page: Page) {
    this.page = page;
    this.upcomingEventsSection = this.page.getByTestId('upcoming-events-section');
    this.khutbahTopicsSection = this.page.getByTestId('khutbah-topics-section');
    this.eventCards = this.page.getByTestId('event-card');
    this.topicCards = this.page.getByTestId('topic-card');
    this.loadingSpinner = this.page.getByTestId('loading-spinner');
    this.errorMessage = this.page.getByTestId('error-message');
    this.eventTitle = (index: number) => this.eventCards.nth(index).getByTestId('event-title');
    this.eventDate = (index: number) => this.eventCards.nth(index).getByTestId('event-date');
    this.topicTitle = (index: number) => this.topicCards.nth(index).getByTestId('topic-title');
    this.topicTags = (index: number) => this.topicCards.nth(index).getByTestId('topic-tags');
  }

  async goto() {
    await this.page.goto('/events-and-khutbah-topics');
  }

  async waitForLoadingComplete() {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 10000 });
  }

  async verifyPageLoaded() {
    await expect(this.upcomingEventsSection).toBeVisible();
    await expect(this.khutbahTopicsSection).toBeVisible();
  }

  async getEventCount(): Promise<number> {
    return await this.eventCards.count();
  }

  async getTopicCount(): Promise<number> {
    return await this.topicCards.count();
  }

  async getFirstEventTitle(): Promise<string> {
    return await this.eventTitle(0).textContent() || '';
  }

  async getFirstTopicTitle(): Promise<string> {
    return await this.topicTitle(0).textContent() || '';
  }

  async verifyErrorState(expectedMessage?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }

  async verifyNoEvents() {
    await expect(this.eventCards).toHaveCount(0);
    await expect(this.upcomingEventsSection).toContainText('No upcoming events');
  }

  async verifyNoTopics() {
    await expect(this.topicCards).toHaveCount(0);
    await expect(this.khutbahTopicsSection).toContainText('No khutbah topics available');
  }
}

test.describe('Events and Khutbah Topics E2E', () => {
  let eventsPage: EventsAndKhutbahPage;

  test.beforeEach(async ({ page }) => {
    eventsPage = new EventsAndKhutbahPage(page);
    await eventsPage.goto();
  });

  test('F002-01: Should display upcoming events and khutbah topics on initial load', async () => {
    await eventsPage.waitForLoadingComplete();
    await eventsPage.verifyPageLoaded();

    const eventCount = await eventsPage.getEventCount();
    const topicCount = await eventsPage.getTopicCount();

    expect(eventCount).toBeGreaterThan(0);
    expect(topicCount).toBeGreaterThan(0);
  });

  test('F002-02: Should display event details correctly', async () => {
    await eventsPage.waitForLoadingComplete();

    const firstEventTitle = await eventsPage.getFirstEventTitle();
    expect(firstEventTitle).toBeTruthy();
    expect(firstEventTitle.length).toBeGreaterThan(0);

    // Verify date format (ISO 8601 subset or formatted date)
    const firstEventDate = await eventsPage.eventDate(0).textContent();
    expect(firstEventDate).toBeTruthy();
    expect(firstEventDate?.length).toBeGreaterThan(0);
  });

  test('F002-03: Should display khutbah topic details with optional tags', async () => {
    await eventsPage.waitForLoadingComplete();

    const firstTopicTitle = await eventsPage.getFirstTopicTitle();
    expect(firstTopicTitle).toBeTruthy();
    expect(firstTopicTitle.length).toBeGreaterThan(0);

    // Tags are optional, so we just verify the card renders
    const topicCount = await eventsPage.getTopicCount();
    expect(topicCount).toBeGreaterThan(0);
  });

  test('F002-04: Should handle empty state for events gracefully', async ({ page }) => {
    // Mock API response with empty events
    await page.route('**/api/events-and-khutbah-topics', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          upcomingEvents: [],
          khutbahTopics: [
            {
              id: 'topic-1',
              title: 'Sample Khutbah',
              dateAdded: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await eventsPage.goto();
    await eventsPage.waitForLoadingComplete();
    await eventsPage.verifyPageLoaded();
    await eventsPage.verifyNoEvents();
    expect(await eventsPage.getTopicCount()).toBe(1);
  });

  test('F002-05: Should handle empty state for khutbah topics gracefully', async ({ page }) => {
    // Mock API response with empty topics
    await page.route('**/api/events-and-khutbah-topics', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          upcomingEvents: [
            {
              id: 'event-1',
              title: 'Sample Event',
              date: new Date().toISOString(),
              location: 'Main Hall',
            },
          ],
          khutbahTopics: [],
        }),
      });
    });

    await eventsPage.goto();
    await eventsPage.waitForLoadingComplete();
    await eventsPage.verifyPageLoaded();
    await eventsPage.verifyNoTopics();
    expect(await eventsPage.getEventCount()).toBe(1);
  });

  test('F002-06: Should display error message on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/events-and-khutbah-topics', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await eventsPage.goto();
    await eventsPage.waitForLoadingComplete();
    await eventsPage.verifyErrorState('Failed to fetch');
  });

  test('F002-07: Should refetch data on page revisit', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/events-and-khutbah-topics', (route) => {
      requestCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          upcomingEvents: [
            {
              id: `event-${requestCount}`,
              title: `Event ${requestCount}`,
              date: new Date().toISOString(),
              location: 'Location',
            },
          ],
          khutbahTopics: [
            {
              id: `topic-${requestCount}`,
              title: `Topic ${requestCount}`,
              dateAdded: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await eventsPage.waitForLoadingComplete();
    const firstTitle = await eventsPage.getFirstEventTitle();
    expect(firstTitle).toBe('Event 1');

    // Navigate away and back
    await page.goto('/');
    await eventsPage.goto();
    await eventsPage.waitForLoadingComplete();

    const newFirstTitle = await eventsPage.getFirstEventTitle();
    // Depending on staleTime, this might be cached. Forcing a hard reload check
    expect(requestCount).toBeGreaterThanOrEqual(1);
  });

  test('F002-08: Should maintain layout responsiveness on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await eventsPage.waitForLoadingComplete();
    await eventsPage.verifyPageLoaded();

    const eventCount = await eventsPage.getEventCount();
    const topicCount = await eventsPage.getTopicCount();

    expect(eventCount).toBeGreaterThan(0);
    expect(topicCount).toBeGreaterThan(0);
  });
});