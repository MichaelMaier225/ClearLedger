import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native"
import { Link, useFocusEffect } from "expo-router"
import {
  getProducts,
  updateQty,
  removeProduct,
  Product,
} from "./products"

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [revenue, setRevenue] = useState(0)
  const [expenses, setExpenses] = useState(0)

  useFocusEffect(() => {
    setProducts(getProducts())
  })

  const sellProduct = (product: Product) => {
    if (product.qty <= 0) return
    updateQty(product.id, -1)
    setProducts(getProducts())
    setRevenue(prev => prev + product.price)
  }

  const wasteProduct = (product: Product) => {
    if (product.qty <= 0) return
    updateQty(product.id, -1)
    setProducts(getProducts())
  }

  const confirmWaste = (product: Product) => {
    Alert.alert(
      "Mark as waste?",
      "Lost or spoiled item",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Waste",
          style: "destructive",
          onPress: () => wasteProduct(product),
        },
      ]
    )
  }

  const restockProduct = (product: Product) => {
    updateQty(product.id, 1)
    setProducts(getProducts())
    setExpenses(prev => prev + product.cost)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.appName}>SAVN</Text>

        <View style={styles.summary}>
          <Text>Revenue: ${revenue.toFixed(2)}</Text>
          <Text>Expenses: ${expenses.toFixed(2)}</Text>
          <Text style={styles.profit}>
            Profit: ${(revenue - expenses).toFixed(2)}
          </Text>
        </View>

        <Link href="/add" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addText}>＋ Add Product</Text>
          </TouchableOpacity>
        </Link>

        {products.map(product => (
          <View key={product.id} style={styles.row}>
            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => sellProduct(product)}
                onLongPress={() => confirmWaste(product)}
              >
                <Text style={styles.buttonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qty}>{product.qty}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => restockProduct(product)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  removeProduct(product.id)
                  setProducts(getProducts())
                }}
              >
                <Text style={styles.delete}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  appName: { fontSize: 32, fontWeight: "bold" },
  summary: { marginBottom: 20 },
  profit: { fontWeight: "bold" },
  addButton: { marginBottom: 20 },
  addText: { fontSize: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  productName: { fontSize: 18 },
  controls: { flexDirection: "row", alignItems: "center" },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 26 },
  qty: { marginHorizontal: 14 },
  delete: { color: "red", marginLeft: 12 },
})
