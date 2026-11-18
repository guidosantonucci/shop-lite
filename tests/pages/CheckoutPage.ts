import { type Page, type Locator } from '@playwright/test';

export interface Customer {
  name: string;
  email: string;
  zip: string;
}

/** Checkout form + order confirmation. */
export class CheckoutPage {
  readonly page: Page;
  readonly root: Locator;
  readonly error: Locator;
  readonly confirmation: Locator;
  readonly orderNumber: Locator;
  readonly orderTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('checkout');
    this.error = page.getByTestId('checkout-error');
    this.confirmation = page.getByTestId('confirmation');
    this.orderNumber = page.getByTestId('order-number');
    this.orderTotal = page.getByTestId('order-total');
  }

  async fill(customer: Partial<Customer>) {
    if (customer.name !== undefined) await this.page.getByTestId('name').fill(customer.name);
    if (customer.email !== undefined) await this.page.getByTestId('email').fill(customer.email);
    if (customer.zip !== undefined) await this.page.getByTestId('zip').fill(customer.zip);
  }

  async placeOrder() {
    await this.page.getByTestId('place-order').click();
  }
}
