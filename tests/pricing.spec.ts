import { test, expect } from './fixtures';

test.describe('Shipping', () => {
  test('orders under $50 pay $5 shipping', async ({ shop, cart }) => {
    await shop.addToCart('SPF 50 Daily Sunscreen'); // $34
    await expect(cart.shipping).toHaveText('$5.00');
    await expect(cart.total).toHaveText('$39.00');
  });

  test('orders of $50 or more ship free', async ({ shop, cart }) => {
    await shop.addToCart('SPF 50 Daily Sunscreen'); // $34
    await shop.addToCart('After-Sun Cooling Gel'); // $18 → $52
    await expect(cart.shipping).toHaveText('Free');
    await expect(cart.total).toHaveText('$52.00');
  });
});

/** Data-driven: one test per discount code. */
const validCodes = [
  { code: 'SUN10', message: '10% off applied', discount: '-$3.40', total: '$35.60' },
  { code: 'sun10', message: '10% off applied', discount: '-$3.40', total: '$35.60' }, // case-insensitive
  { code: 'SAVE5', message: '$5 off applied', discount: '-$5.00', total: '$34.00' },
  { code: 'FREESHIP', message: 'Free shipping applied', discount: '-$0.00', total: '$34.00' },
];

test.describe('Discount codes', () => {
  for (const { code, message, discount, total } of validCodes) {
    test(`valid code "${code}" is applied to a $34 cart`, async ({ shop, cart }) => {
      await shop.addToCart('SPF 50 Daily Sunscreen');
      await cart.applyCode(code);

      await expect(cart.discountMessage).toHaveText(message);
      await expect(cart.discount).toHaveText(discount);
      await expect(cart.total).toHaveText(total);
    });
  }

  for (const code of ['BOGUS', 'SUN 10', '10SUN']) {
    test(`invalid code "${code}" shows an error and changes nothing`, async ({ shop, cart }) => {
      await shop.addToCart('SPF 50 Daily Sunscreen');
      await cart.applyCode(code);

      await expect(cart.discountMessage).toContainText('is not a valid code');
      await expect(cart.discount).toHaveText('-$0.00');
      await expect(cart.total).toHaveText('$39.00');
    });
  }

  test('empty code asks the user to enter one', async ({ shop, cart }) => {
    await shop.addToCart('SPF 30 Lip Balm');
    await cart.applyCode('   ');
    await expect(cart.discountMessage).toHaveText('Enter a discount code');
  });

  test('a fixed discount never makes the total negative', async ({ shop, cart }) => {
    await shop.addToCart('SPF 30 Lip Balm'); // $9.50
    await cart.applyCode('SAVE5');
    await expect(cart.discount).toHaveText('-$5.00');
    await expect(cart.total).toHaveText('$9.50'); // 4.50 + 5.00 shipping
  });
});
