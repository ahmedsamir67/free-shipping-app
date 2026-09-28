import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useState} from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

/**
 * The discount code that this extension applies. The code must already exist
 * and be active in Shopify admin (Discounts > FREESHIPPING2026).
 */
const DISCOUNT_CODE = 'FREESHIPPING2026';

const Status = {
  Idle: 'idle',
  Applying: 'applying',
  Error: 'error',
};

function Extension() {
  const [status, setStatus] = useState(Status.Idle);

  // Checkout tells us whether discount codes may be changed at all. This is
  // false for accelerated checkouts (Apple Pay, Google Pay, Shop Pay) and when
  // the shop has locked discounts, in which case applyDiscountCodeChange
  // always fails.
  const canUpdateDiscountCodes =
    shopify.instructions.value.discounts.canUpdateDiscountCodes;

  // Read the applied state from checkout rather than from local state, so the
  // success message survives a page reload and also appears when the buyer
  // typed the code into the discount field themselves. Codes are
  // case-insensitive.
  const isApplied = shopify.discountCodes.value.some(
    ({code}) => code.toLowerCase() === DISCOUNT_CODE.toLowerCase(),
  );

  if (isApplied) {
    return (
      <s-banner heading={shopify.i18n.translate('successHeading')} tone="success">
        <s-text>
          {shopify.i18n.translate('successBody', {code: DISCOUNT_CODE})}
        </s-text>
      </s-banner>
    );
  }

  // Nothing to offer if checkout will not accept the change. Render nothing
  // rather than a warning, since this is a promotional block.
  if (!canUpdateDiscountCodes) {
    return null;
  }

  async function applyFreeShipping() {
    setStatus(Status.Applying);

    try {
      const result = await shopify.applyDiscountCodeChange({
        type: 'addDiscountCode',
        code: DISCOUNT_CODE,
      });

      if (result.type === 'success') {
        // shopify.discountCodes updates on success, which re-renders this
        // component into the success state above.
        setStatus(Status.Idle);
        return;
      }

      // result.message is a debugging aid: it is not localized and must not be
      // shown to the buyer.
      console.error('[apply-free-shipping] Discount code rejected:', result.message);
      setStatus(Status.Error);
    } catch (error) {
      console.error('[apply-free-shipping] Discount code change failed:', error);
      setStatus(Status.Error);
    }
  }

  const isApplying = status === Status.Applying;

  return (
    <s-stack gap="base">
      <s-banner heading={shopify.i18n.translate('offerHeading')} tone="info">
        <s-stack gap="base">
          <s-text>
            {shopify.i18n.translate('offerBody', {code: DISCOUNT_CODE})}
          </s-text>
          <s-button
            onClick={applyFreeShipping}
            loading={isApplying}
            disabled={isApplying}
          >
            {shopify.i18n.translate('applyButton')}
          </s-button>
        </s-stack>
      </s-banner>

      {status === Status.Error ? (
        <s-banner heading={shopify.i18n.translate('errorHeading')} tone="critical">
          <s-text>{shopify.i18n.translate('errorBody')}</s-text>
        </s-banner>
      ) : null}
    </s-stack>
  );
}
