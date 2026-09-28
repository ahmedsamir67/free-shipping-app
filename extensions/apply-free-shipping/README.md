# Apply free shipping — Checkout UI Extension

Renders a promotional banner in checkout with an **Apply Free Shipping** button.
Clicking it applies the pre-existing `FREESHIPPING2026` discount code to the
checkout and swaps the banner for a success message.

This is a **Checkout UI Extension**, not a Shopify Discount Function. It does
not create or calculate a discount; it applies a discount code that a merchant
has already created in Shopify admin.

## Files

| File | Purpose |
| --- | --- |
| `shopify.extension.toml` | Extension config: API version, target, capabilities, and the `uid` that links this folder to its server-side record. |
| `src/Checkout.jsx` | The extension. Preact component rendered into the checkout. |
| `locales/en.default.json` | English copy. `en.default` is the fallback for any unsupported locale. |
| `locales/fr.json` | French copy, used automatically when checkout renders in French. |
| `shopify.d.ts` | Types the global `shopify` object for this extension's target, giving editor autocomplete. |
| `tsconfig.json` | Type-checks the JSX via `checkJs`. Nothing is emitted; the CLI bundles the extension. |
| `package.json` | Extension dependencies. Installed into the app root by npm workspaces. |

## Target

```
purchase.checkout.reductions.render-before
```

Renders in the order summary immediately **above** the discount code field.

This is a **static** target. Like every checkout UI extension, it does not
display until the merchant activates it once in the checkout editor
(Settings › Checkout › Customize checkout › **Add app block**). What “static”
changes is placement, not activation: unlike `purchase.checkout.block.render`
the merchant cannot drag it elsewhere — it is pinned above the discount field —
and it stops rendering whenever checkout does not render the reductions
section.

During local development the extension only appears in the **Add app block**
list while `shopify app dev` is running.

## How it works

1. Reads `shopify.instructions.value.discounts.canUpdateDiscountCodes`. When
   checkout will not accept discount changes — accelerated checkouts such as
   Apple Pay, Google Pay and Shop Pay, or a shop that has locked discounts —
   the extension renders nothing instead of showing a button that cannot work.
2. Reads `shopify.discountCodes.value` to decide whether the code is already
   applied, comparing case-insensitively. Applied state comes from checkout
   rather than local component state, so the success message survives a page
   reload and also shows when the buyer typed the code in manually.
3. On click, calls
   `shopify.applyDiscountCodeChange({type: 'addDiscountCode', code: 'FREESHIPPING2026'})`.
   The button shows a loading state until the promise resolves.
4. On success, `shopify.discountCodes` updates, which re-renders the component
   into its success state.
5. On failure, logs `result.message` to the console and shows a localized
   error banner. `result.message` is a debugging aid: Shopify does not localize
   it and it must not be shown to buyers.

## Capabilities

Both `api_access` and `network_access` are **off**. The Discounts API is
available to every `purchase.checkout.*` target without extra capabilities, and
this extension queries no Storefront API data and makes no external calls.

## Prerequisites in Shopify admin

The extension must be activated in the checkout editor (Settings › Checkout ›
Customize checkout › **Add app block**). Installing the app alone does not make
it render.

A discount named exactly `FREESHIPPING2026` must exist and be **Active**, of type
**Free shipping**, with shipping-rate eligibility covering the test address. If
it carries a minimum purchase requirement, carts below that minimum will take
the error path — that is correct behaviour, not a bug.

## Changing the discount code

Edit the `DISCOUNT_CODE` constant at the top of `src/Checkout.jsx`. To let each
merchant choose their own code instead, add an `[extensions.settings]` block to
`shopify.extension.toml` and read it from `shopify.settings.value`.
