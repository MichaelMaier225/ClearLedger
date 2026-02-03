import { Tabs } from "expo-router"

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Inventory" }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: "Add" }}
      />
      <Tabs.Screen
        name="adjust"
        options={{ title: "Adjust" }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: "Explore" }}
      />
    </Tabs>
  )
}
