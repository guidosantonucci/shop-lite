import { type Page, type Locator } from '@playwright/test';

/** Cart drawer: lines, discount codes, totals. */
export class CartPage {
  readonly page: Page;
  readonly root: Locator;
  readonly lines: Locator;
  readonly emptyMessage: Locator;
  readonly discountInput: Locator;
  readonly discountApply: Locator;
  readonly discountMessage: Locator;
  readonly subtotal: Locator;
  readonly discount: Locator;
  readonly shipping: Locator;
  readonly total: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('cart');
    this.lines = page.getByTestId('cart-line');
    this.emptyMessage = page.getByTestId('cart-empty');
    this.discountInput = page.getByTestId('discount-input');
    this.discountApply = page.getByTestId('discount-apply');
    this.discountMessage = page.getByTestId('discount-message');
    this.subtotal = page.getByTestId('subtotal');
    this.discount = page.getByTestId('discount');
    this.shipping = page.getByTestId('shipping');
    this.total = page.getByTestId('total');
    this.checkoutButton = page.getByTestId('checkout-btn');
  }

  line(name: string): Locator {
    return this.lines.filter({ hasText: name });
  }

  async increase(name: string) {
    await this.line(name).getByTestId('qty-increase').click();
  }

  async decrease(name: string) {
    await this.line(name).getByTestId('qty-decrease').click();
  }

  async remove(name: string) {
    await this.line(name).getByTestId('remove-line').click();
  }

  async applyCode(code: string) {
    await this.discountInput.fill(code);
    await this.discountApply.click();
  }
}
