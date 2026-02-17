const SHOPIFY_API_VERSION = "2024-10";
const LOOKBACK_DAYS = 30;

const msInDay = 24 * 60 * 60 * 1000;

const formatDay = (date) => date.toISOString().slice(0, 10);

const getDateRange = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - LOOKBACK_DAYS * msInDay);
  return { startDate, endDate };
};

const buildShopifyUrl = (shopDomain, path, searchParams) => {
  const url = new URL(`https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/${path}`);
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const getCredentials = () => {
  const shopDomain = process.env.EXPO_PUBLIC_SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.EXPO_PUBLIC_SHOPIFY_ADMIN_ACCESS_TOKEN;

  return { shopDomain, accessToken };
};

const shopifyFetch = async (shopDomain, accessToken, path, params) => {
  const response = await fetch(buildShopifyUrl(shopDomain, path, params), {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error ${response.status}: ${text || "Unknown response"}`);
  }

  return response.json();
};

const toAmount = (value) => Number.parseFloat(value || 0);

const calculateOrderMetrics = (orders) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, order) => acc + toAmount(order.current_total_price), 0);

  const customerOrderCount = {};
  orders.forEach((order) => {
    const customerId = order.customer?.id;
    if (customerId) {
      customerOrderCount[customerId] = (customerOrderCount[customerId] || 0) + 1;
    }
  });

  const returningCustomers = Object.values(customerOrderCount).filter((count) => count > 1).length;
  const uniqueCustomers = Object.keys(customerOrderCount).length;

  const dailySalesMap = {};
  const productSalesMap = {};

  orders.forEach((order) => {
    const dayKey = formatDay(new Date(order.created_at));
    dailySalesMap[dayKey] = (dailySalesMap[dayKey] || 0) + toAmount(order.current_total_price);

    (order.line_items || []).forEach((item) => {
      const productName = item.title || "Untitled Product";
      if (!productSalesMap[productName]) {
        productSalesMap[productName] = { title: productName, unitsSold: 0, revenue: 0 };
      }
      productSalesMap[productName].unitsSold += item.quantity || 0;
      productSalesMap[productName].revenue += toAmount(item.price) * (item.quantity || 0);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const dailySales = Object.entries(dailySalesMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
    returningCustomerRate: uniqueCustomers ? (returningCustomers / uniqueCustomers) * 100 : 0,
    dailySales,
    topProducts,
  };
};

const generateDemoAnalytics = () => {
  const { startDate } = getDateRange();
  const days = Array.from({ length: LOOKBACK_DAYS }).map((_, index) => {
    const date = new Date(startDate.getTime() + index * msInDay);
    const revenue = 700 + Math.round(Math.random() * 1200);
    return {
      date: formatDay(date),
      revenue,
    };
  });

  const totalRevenue = days.reduce((acc, day) => acc + day.revenue, 0);
  const totalOrders = 410;

  return {
    mode: "demo",
    dateRangeDays: LOOKBACK_DAYS,
    generatedAt: new Date().toISOString(),
    kpis: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalRevenue / totalOrders,
      totalCustomers: 265,
      totalProducts: 118,
      returningCustomerRate: 34.2,
    },
    dailySales: days,
    topProducts: [
      { title: "Sequin Star Blazer", unitsSold: 88, revenue: 7480 },
      { title: "Queen Glam Midi Dress", unitsSold: 73, revenue: 6935 },
      { title: "Crystal Fringe Top", unitsSold: 52, revenue: 4160 },
      { title: "Royal Sparkle Skirt", unitsSold: 44, revenue: 3300 },
      { title: "Night Light Jumpsuit", unitsSold: 39, revenue: 3120 },
    ],
  };
};

export const fetchShopifyAnalytics = async () => {
  const { shopDomain, accessToken } = getCredentials();

  if (!shopDomain || !accessToken) {
    return generateDemoAnalytics();
  }

  const { startDate } = getDateRange();

  const [ordersResponse, customersCountResponse, productsCountResponse] = await Promise.all([
    shopifyFetch(shopDomain, accessToken, "orders.json", {
      status: "any",
      limit: 250,
      created_at_min: startDate.toISOString(),
      fields: "id,created_at,current_total_price,customer,line_items",
    }),
    shopifyFetch(shopDomain, accessToken, "customers/count.json"),
    shopifyFetch(shopDomain, accessToken, "products/count.json"),
  ]);

  const orderMetrics = calculateOrderMetrics(ordersResponse.orders || []);

  return {
    mode: "live",
    dateRangeDays: LOOKBACK_DAYS,
    generatedAt: new Date().toISOString(),
    kpis: {
      totalRevenue: orderMetrics.totalRevenue,
      totalOrders: orderMetrics.totalOrders,
      averageOrderValue: orderMetrics.averageOrderValue,
      totalCustomers: customersCountResponse.count || 0,
      totalProducts: productsCountResponse.count || 0,
      returningCustomerRate: orderMetrics.returningCustomerRate,
    },
    dailySales: orderMetrics.dailySales,
    topProducts: orderMetrics.topProducts,
  };
};
