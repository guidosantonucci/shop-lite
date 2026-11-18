import { type Page, type Locator, expect } from '@playwright/test';

/** Product grid + header. */
export class ShopPage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly cartCount: Locator;
  readonly cartToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.getByTestId('product-card');
    this.cartCount = page.getByTestId('cart-count');
    this.cartToggle = page.getByTestId('cart-toggle');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.productCards.first()).toBeVisible();
  }

  product(name: string): Locator {
    return this.productCards.filter({ has: this.page.getByTestId('product-name').getByText(name, { exact: true }) });
  }

  async addToCart(name: string, times = 1) {
    for (let i = 0; i < times; i++) {
      await this.product(name).getByTestId('add-to-cart').click();
    }
  }
}
