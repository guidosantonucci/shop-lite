import { test as base } from '@playwright/test';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

type Pages = { shop: ShopPage; cart: CartPage; checkout: CheckoutPage };

/** Custom fixtures: every test gets ready-made page objects with the shop already open. */
export const test = base.extend<Pages>({
  shop: async ({ page }, use) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await use(shop);
  },
  cart: async ({ page }, use) => use(new CartPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect } from '@playwright/test';
