import { useCallback, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native"
import { useFocusEffect } from "expo-router"

import {
  adjustInventory,
  getProducts,
  undoLastAction,
  Product,
} from "../../store/products"

type AdjustMode = "add" | "remove"

export default function AdjustInventoryScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null)
  const [adjustQty, setAdjustQty] = useState("1")
  const [adjustMode, setAdjustMode] = useState<AdjustMode>("remove")

  const refresh = () => {
    setProducts([...getProducts()])
  }

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [])
  )

  const openAdjust = (product: Product, mode: AdjustMode) => {
    setAdjustProduct(product)
    setAdjustMode(mode)
    setAdjustQty("1")
  }

  const closeAdjust = () => {
    setAdjustProduct(null)
  }

  const applyAdjust = () => {
    if (!adjustProduct) return
    const qtyValue = Number.parseInt(adjustQty, 10)
    if (Number.isNaN(qtyValue) || qtyValue <= 0) {
      Alert.alert("Enter a valid quantity", "Quantity must be at least 1.")
      return
    }

    const delta = adjustMode === "add" ? qtyValue : -qtyValue
    adjustInventory(adjustProduct.id, delta)
    setCanUndo(true)
    refresh()
    closeAdjust()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Adjust Inventory</Text>
        <Text style={styles.subtitle}>
          Use this page for spoilage, loss, or found stock. These adjustments do
          not affect revenue or expenses.
        </Text>

        {products.map(product => (
          <View key={product.id} style={styles.row}>
            <View style={styles.nameWrap}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.qty}>Qty: {product.qty}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.lossButton]}
                onPress={() => openAdjust(product, "remove")}
              >
                <Text style={styles.actionText}>Record Loss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={() => openAdjust(product, "add")}
              >
                <Text style={styles.actionText}>Add Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.undoButton, !canUndo && styles.undoDisabled]}
          disabled={!canUndo}
          onPress={() => {
            undoLastAction()
            setCanUndo(false)
            refresh()
          }}
        >
          <Text style={[styles.undoText, !canUndo && styles.undoTextDisabled]}>
            Undo Last Adjustment
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={!!adjustProduct}
        onRequestClose={closeAdjust}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {adjustMode === "add" ? "Add stock for" : "Record loss for"}{" "}
              {adjustProduct?.name}
            </Text>
            <Text style={styles.modalLabel}>Quantity</Text>
            <TextInput
              style={styles.modalInput}
              value={adjustQty}
              onChangeText={setAdjustQty}
              keyboardType="number-pad"
              placeholder="Enter quantity"
            />
            <Text style={styles.modalHint}>
              This adjustment does not change revenue or expenses.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={closeAdjust}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={applyAdjust}
              >
                <Text style={styles.modalConfirmText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#555",
    marginBottom: 20,
  },
  row: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  nameWrap: {
    marginBottom: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  qty: {
    marginTop: 4,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  lossButton: {
    backgroundColor: "#000",
  },
  addButton: {
    backgroundColor: "#1a1a1a",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  undoButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  undoDisabled: {
    borderColor: "#ddd",
  },
  undoText: {
    color: "#333",
    fontWeight: "600",
  },
  undoTextDisabled: {
    color: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancel: {
    backgroundColor: "#f2f2f2",
    marginRight: 10,
  },
  modalConfirm: {
    backgroundColor: "#000",
    marginLeft: 10,
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "600",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "600",
  },
})
