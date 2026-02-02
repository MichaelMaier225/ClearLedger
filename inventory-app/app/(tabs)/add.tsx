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

import { addProduct } from "../../store/products"

export default function AddProductScreen() {
  const [name, setName] = useState("")
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")

  const handleAdd = () => {
    if (!name.trim()) return
    if (Number.isNaN(Number(qty))) return
    if (Number.isNaN(Number(price))) return
    if (Number.isNaN(Number(cost))) return

    addProduct(
      name.trim(),
      Number(qty),
      Number(price),
      Number(cost)
    )

    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Product</Text>

        <TextInput
          style={styles.input}
          placeholder="Product name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Starting quantity"
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
        />

        <TextInput
          style={styles.input}
          placeholder="Price per unit"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Cost per unit"
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
        />

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>ADD PRODUCT</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})
