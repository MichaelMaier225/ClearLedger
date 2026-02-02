import { useLocalSearchParams, router } from "expo-router"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native"

import {
  getProducts,
  updateProduct,
  removeProduct,
  Product,
} from "../../store/products"

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const productId = Number(id)

  const [product, setProduct] = useState<Product | null>(null)

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")

  useEffect(() => {
    const found = getProducts().find(p => p.id === productId)
    if (found) {
      setProduct(found)
      setName(found.name)
      setPrice(String(found.price))
      setCost(String(found.cost))
    }
  }, [])

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Product not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const handleSave = () => {
    if (!name || !price || !cost) return

    updateProduct(product.id, {
      name,
      price: Number(price),
      cost: Number(cost),
    })

    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Product</Text>

        <Text style={styles.label}>Product name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Price per unit</Text>
        <TextInput
          style={styles.input}
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Cost per unit</Text>
        <TextInput
          style={styles.input}
          value={cost}
          keyboardType="numeric"
          onChangeText={setCost}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() =>
            Alert.alert(
              "Delete product",
              "This will permanently remove this product and its history.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    removeProduct(product.id)
                    router.back()
                  },
                },
              ]
            )
          }
        >
          <Text style={styles.deleteText}>Delete product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteBtn: {
    marginTop: 30,
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e00",
    alignItems: "center",
  },
  deleteText: {
    color: "#e00",
    fontWeight: "bold",
  },
})
