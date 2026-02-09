import { Tabs } from "expo-router"

import { useColorScheme } from "@/hooks/use-color-scheme"
import { Colors } from "@/constants/theme"
import { useLanguage } from "../../hooks/use-language"

export default function TabLayout() {
  const { t } = useLanguage()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? "light"]

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.icon,
          borderTopWidth: 0.5,
          paddingTop: 6,
          paddingBottom: 8,
          height: 62,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{ title: t("explore") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: t("history") }}
      />
      <Tabs.Screen
        name="catalog"
        options={{ title: t("vendors") }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: t("inventory") }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: t("analytics") }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t("insights") }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t("settings") }}
      />
    </Tabs>
  )
}
