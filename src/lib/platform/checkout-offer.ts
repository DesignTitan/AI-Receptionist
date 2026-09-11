import { stripe, verifyCheckoutPrices, priceId } from "./billing";
import { setupCents, SETUP_SCOPE, PLANS, type Plan } from "./pricing";

/** A versioned, fixed setup price. Never edits an existing customer's price. */
export async function checkoutSetupPrice(plan: Plan) {
  const cents = setupCents(plan);
  const lookup = `receptionist_setup_flat_${cents}_v4`;
  const prices = await stripe(`prices?lookup_keys[]=${lookup}&active=true`);
  let price = prices.data?.[0];
  if (!price) {
    const products = await stripe(`products?ids[]=receptionist_setup_flat_${cents}_v4`);
    const product = products.data?.[0] ?? await stripe("products", new URLSearchParams({
      id: `receptionist_setup_flat_${cents}_v4`,
      name: "One-time setup",
      description: SETUP_SCOPE,
    }), `setup-product-${cents}-v4`);
    price = await stripe("prices", new URLSearchParams({
      product: product.id, currency: "usd", unit_amount: String(cents), lookup_key: lookup,
    }), `setup-price-${cents}-v4`);
  }
  await verifyCheckoutPrices(plan, priceId(plan), price.id, cents);
  const recurring = await stripe(`prices/${priceId(plan)}`);
  const p = PLANS[plan];
  await stripe(`products/${recurring.product}`, new URLSearchParams({
    name: p.name,
    description: `${p.minutes.toLocaleString()} monthly call minutes. Up to ${p.teamLimit} team members. One location.`,
  }), `plan-description-${plan}-flat-v4`);
  return price.id as string;
}
