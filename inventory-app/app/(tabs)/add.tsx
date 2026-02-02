import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native"
import { router } from "expo-router"
import { addProduct } from "./products"

export default function AddProductScreen() {
  const [name, setName] = useState("")
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")

  const saveProduct = () => {
    if (!name || !qty || !price || !cost) return
    addProduct(name, Number(qty), Number(price), Number(cost))
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Product</Text>

        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Qty" value={qty} onChangeText={setQty} keyboardType="number-pad" style={styles.input} />
        <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} />
        <TextInput placeholder="Cost" value={cost} onChangeText={setCost} keyboardType="decimal-pad" style={styles.input} />

        <TouchableOpacity style={styles.button} onPress={saveProduct}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
})
