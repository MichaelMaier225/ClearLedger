import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchShopifyAnalytics } from "../services/shopify";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

const MetricCard = ({ label, value, helper }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    {helper ? <Text style={styles.metricHelper}>{helper}</Text> : null}
  </View>
);

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const response = await fetchShopifyAnalytics();
      setAnalytics(response);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load Shopify analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const topDay = useMemo(() => {
    if (!analytics?.dailySales?.length) {
      return null;
    }

    return analytics.dailySales.reduce((best, day) => {
      if (!best || day.revenue > best.revenue) {
        return day;
      }
      return best;
    }, null);
  }, [analytics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shopify Intelligence</Text>
          <Text style={styles.subtitle}>Customer, order, and product performance</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={() => loadAnalytics({ isRefresh: true })}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1B6EF3" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAnalytics({ isRefresh: true })} />}
        >
          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Connection Issue</Text>
              <Text style={styles.errorBody}>{error}</Text>
            </View>
          ) : null}

          {analytics?.mode === "demo" ? (
            <View style={styles.demoCard}>
              <Text style={styles.demoTitle}>Demo data mode enabled</Text>
              <Text style={styles.demoBody}>
                Add Shopify credentials to switch from simulated insights to live store analytics.
              </Text>
            </View>
          ) : null}

          <View style={styles.metricsGrid}>
            <MetricCard label="Revenue (30d)" value={formatCurrency(analytics?.kpis?.totalRevenue)} />
            <MetricCard label="Orders" value={`${analytics?.kpis?.totalOrders || 0}`} />
            <MetricCard
              label="Average Order Value"
              value={formatCurrency(analytics?.kpis?.averageOrderValue)}
            />
            <MetricCard label="Returning Customers" value={formatPercent(analytics?.kpis?.returningCustomerRate)} />
            <MetricCard label="Customer Count" value={`${analytics?.kpis?.totalCustomers || 0}`} />
            <MetricCard label="Product Catalog" value={`${analytics?.kpis?.totalProducts || 0}`} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Executive highlights</Text>
            <Text style={styles.sectionLine}>
              • Best performing day: {topDay ? `${topDay.date} (${formatCurrency(topDay.revenue)})` : "n/a"}
            </Text>
            <Text style={styles.sectionLine}>
              • Data source: {analytics?.mode === "live" ? "Live Shopify API" : "Professional demo profile"}
            </Text>
            <Text style={styles.sectionLine}>• Last refreshed: {new Date(analytics?.generatedAt).toLocaleString()}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Top products by revenue</Text>
            {(analytics?.topProducts || []).map((product, index) => (
              <View key={`${product.title}-${index}`} style={styles.rowItem}>
                <View>
                  <Text style={styles.rowTitle}>{product.title}</Text>
                  <Text style={styles.rowSub}>Units sold: {product.unitsSold}</Text>
                </View>
                <Text style={styles.rowValue}>{formatCurrency(product.revenue)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Daily sales trend (last 30 days)</Text>
            {(analytics?.dailySales || []).slice(-10).map((day) => (
              <View key={day.date} style={styles.rowItem}>
                <Text style={styles.rowTitle}>{day.date}</Text>
                <Text style={styles.rowValue}>{formatCurrency(day.revenue)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    fontSize: 13,
    color: "#667085",
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: "#1B6EF3",
    borderRadius: 12,
    minHeight: 40,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#667085",
  },
  content: {
    paddingBottom: 26,
    gap: 14,
  },
  errorCard: {
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
  },
  errorTitle: {
    color: "#B42318",
    fontWeight: "700",
    marginBottom: 4,
  },
  errorBody: {
    color: "#912018",
    fontSize: 13,
  },
  demoCard: {
    backgroundColor: "#FFF6ED",
    borderRadius: 14,
    padding: 14,
  },
  demoTitle: {
    color: "#C4320A",
    fontWeight: "700",
    marginBottom: 4,
  },
  demoBody: {
    color: "#9A3412",
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#101828",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: "#667085",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#101828",
    marginTop: 6,
  },
  metricHelper: {
    fontSize: 12,
    color: "#98A2B3",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    color: "#101828",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  sectionLine: {
    color: "#475467",
    fontSize: 13,
    lineHeight: 20,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  rowTitle: {
    color: "#101828",
    fontWeight: "600",
    fontSize: 14,
  },
  rowSub: {
    color: "#667085",
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    color: "#1B6EF3",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default AnalyticsScreen;
