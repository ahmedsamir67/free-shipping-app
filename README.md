# free-shipping-app

A Shopify app containing a single **Checkout UI Extension** that applies an
existing `FREESHIPPING2026` discount code to checkout when the buyer clicks a
button.

Built with Checkout UI Extensions API **2026-07** (Preact + Polaris web
components). It deliberately does **not** use a Shopify Discount Function: the
discount is created by the merchant in Shopify admin, and this extension only
applies the code.

## Project layout

```
free-shipping-app/
├── extensions/
│   └── apply-free-shipping/     The checkout UI extension (see its README)
├── shopify.app.toml             App config: client_id, scopes, auth URLs
├── package.json                 npm workspace root; extensions/* are workspaces
├── .graphqlrc.js                GraphQL tooling config (inactive - no schemas)
└── mcp.json                     Optional Shopify Dev MCP server for AI tools
```

There is no web server in this app. Checkout UI extensions run on Shopify's
infrastructure, so there is nothing to host and no backend to deploy.

## Prerequisites

1. Shopify CLI installed (`shopify version`).
2. A development store.
3. A discount in Shopify admin named exactly `FREESHIPPING2026`, **Active**, of
   type **Free shipping**.

## Commands

```shell
# Log in / switch Shopify account
shopify auth login

# Run locally against a development store
shopify app dev --store <your-store>.myshopify.com

# Jump straight into checkout with a product in the cart
shopify app dev --store <your-store>.myshopify.com --checkout-cart-url "/cart/<variantId>:1"

# Remove the dev preview from the store when finished
shopify app dev clean --store <your-store>.myshopify.com

# Compile without deploying
shopify app build

# Create a version AND release it to merchants
shopify app deploy

# Create a version without releasing it
shopify app deploy --no-release
```

## Plan requirement

Checkout UI extensions on the information, shipping and payment steps -
including the order summary target this extension uses - are available only to
stores on a **Shopify Plus** plan. Development stores have these features
enabled, so local testing works. On a non-Plus production store the extension
will not render.
