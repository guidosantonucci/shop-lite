import { test, expect } from './fixtures';

const validCustomer = { name: 'Ada Lovelace', email: 'ada@example.com', zip: '10001' };

test.describe('Checkout', () => {
  test.beforeEach(async ({ shop, cart }) => {
    await shop.addToCart('SPF 50 Daily Sunscreen');
    await cart.checkoutButton.click();
  });

  test('happy path: places an order and empties the cart @smoke', async ({ shop, checkout }) => {
    await checkout.fill(validCustomer);
    await checkout.placeOrder();

    await expect(checkout.confirmation).toBeVisible();
    await expect(checkout.orderNumber).toHaveText(/^SL-\d{6}$/);
    await expect(checkout.orderTotal).toHaveText('$39.00');
    await expect(shop.cartCount).toHaveText('0');
  });

  const invalidInputs = [
    { field: 'name', data: { ...validCustomer, name: '' }, error: 'Full name is required' },
    { field: 'email', data: { ...validCustomer, email: 'not-an-email' }, error: 'Enter a valid email address' },
    { field: 'email', data: { ...validCustomer, email: 'ada@example' }, error: 'Enter a valid email address' },
    { field: 'zip', data: { ...validCustomer, zip: '123' }, error: 'ZIP code must be 5 digits' },
    { field: 'zip', data: { ...validCustomer, zip: 'abcde' }, error: 'ZIP code must be 5 digits' },
  ];

  for (const { field, data, error } of invalidInputs) {
    test(`rejects invalid ${field}: "${data[field as keyof typeof data]}"`, async ({ checkout }) => {
      await checkout.fill(data);
      await checkout.placeOrder();

      await expect(checkout.error).toHaveText(error);
      await expect(checkout.confirmation).toBeHidden();
    });
  }
});
