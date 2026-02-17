# SAVN — Shopify Analytics Dashboard

A professional mobile dashboard for **Queen of Sparkles** with executive KPIs and Shopify intelligence.

## What this version includes
- Shopify analytics workspace (customers, products, orders, AOV, retention rate).
- Executive highlights for quick leadership updates.
- Top-product leaderboard and daily sales trend.
- Demo mode fallback for presentations when credentials are not configured.

## Quick start (single command after setup)

### 1) Install once
```bash
npm install
```

### 2) (Optional, for live Shopify data) configure environment
Copy `.env.example` to `.env` and set your values:
```bash
cp .env.example .env
```

Required keys:
- `EXPO_PUBLIC_SHOPIFY_SHOP_DOMAIN` (example: `queen-of-sparkles.myshopify.com`)
- `EXPO_PUBLIC_SHOPIFY_ADMIN_ACCESS_TOKEN` (Admin API token from a custom app)

### 3) Run
```bash
npm start
```

Then open the app and go to the **Analytics** tab.

## Shopify scopes needed
For current analytics features, your Shopify custom app token should include read scopes:
- `read_orders`
- `read_customers`
- `read_products`

## Notes
- No credentials? Analytics tab still works using realistic demo data for stakeholder demos.
- Credentials present? App uses live Shopify Admin API data.
