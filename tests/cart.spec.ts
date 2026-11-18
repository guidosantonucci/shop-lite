import { test, expect } from './fixtures';

test.describe('Cart', () => {
  test('shows all products on the home page @smoke', async ({ shop }) => {
    await expect(shop.productCards).toHaveCount(4);
    await expect(shop.page).toHaveTitle(/Shop Lite/);
  });

  test('cart starts empty and checkout is disabled @smoke', async ({ shop, cart }) => {
    await shop.cartToggle.click();
    await expect(cart.emptyMessage).toBeVisible();
    await expect(shop.cartCount).toHaveText('0');
    await expect(cart.checkoutButton).toBeDisabled();
  });

  test('adding a product updates the count and line total', async ({ shop, cart }) => {
    await shop.addToCart('SPF 50 Daily Sunscreen');

    await expect(shop.cartCount).toHaveText('1');
    await expect(cart.lines).toHaveCount(1);
    await expect(cart.line('SPF 50 Daily Sunscreen').getByTestId('line-total')).toHaveText('$34.00');
    await expect(cart.checkoutButton).toBeEnabled();
  });

  test('adding the same product twice increases quantity, not lines', async ({ shop, cart }) => {
    await shop.addToCart('SPF 30 Lip Balm', 2);

    await expect(cart.lines).toHaveCount(1);
    await expect(cart.line('SPF 30 Lip Balm').getByTestId('line-qty')).toHaveText('2');
    await expect(cart.subtotal).toHaveText('$19.00');
  });

  test('quantity can be increased, decreased and removed', async ({ shop, cart }) => {
    await shop.addToCart('Mineral Face Mist');
    await cart.increase('Mineral Face Mist');
    await expect(cart.line('Mineral Face Mist').getByTestId('line-qty')).toHaveText('2');

    await cart.decrease('Mineral Face Mist');
    await expect(cart.line('Mineral Face Mist').getByTestId('line-qty')).toHaveText('1');

    await cart.decrease('Mineral Face Mist'); // qty 0 removes the line
    await expect(cart.lines).toHaveCount(0);
    await expect(cart.emptyMessage).toBeVisible();
  });

  test('quantity is capped at 10 per item', async ({ shop, cart }) => {
    await shop.addToCart('SPF 30 Lip Balm');
    for (let i = 0; i < 12; i++) await cart.increase('SPF 30 Lip Balm');
    await expect(cart.line('SPF 30 Lip Balm').getByTestId('line-qty')).toHaveText('10');
  });

  test('remove button deletes only that line', async ({ shop, cart }) => {
    await shop.addToCart('SPF 50 Daily Sunscreen');
    await shop.addToCart('After-Sun Cooling Gel');
    await cart.remove('SPF 50 Daily Sunscreen');

    await expect(cart.lines).toHaveCount(1);
    await expect(cart.line('After-Sun Cooling Gel')).toBeVisible();
  });

  test('cart survives a page reload (localStorage)', async ({ shop, cart, page }) => {
    await shop.addToCart('After-Sun Cooling Gel', 2);
    await page.reload();

    await expect(shop.cartCount).toHaveText('2');
    await shop.cartToggle.click();
    await expect(cart.subtotal).toHaveText('$36.00');
  });
});
