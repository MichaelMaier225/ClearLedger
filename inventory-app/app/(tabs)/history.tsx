import { useCallback, useMemo, useState } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native"
import { useFocusEffect } from "expo-router"

import { getTransactions, Transaction } from "../../store/transactions"
import { useLanguage } from "../../hooks/use-language"
import { useCurrency } from "../../hooks/use-currency"

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const applyTemplate = (
  template: string,
  data: Record<string, string>
) =>
  Object.entries(data).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    template
  )

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { t } = useLanguage()
  const { formatMoney } = useCurrency()

  useFocusEffect(
    useCallback(() => {
      const data = [...getTransactions()].reverse()
      setTransactions(data)
    }, [])
  )

  const templateByType = useMemo(
    () => ({
      sale: t("historySale"),
      restock: t("historyRestock"),
      adjustment: t("historyAdjustment"),
    }),
    [t]
  )

  const formatRow = (transaction: Transaction) => {
    const template = templateByType[transaction.type]
    return applyTemplate(template, {
      quantity: String(transaction.quantity),
      product: transaction.productName,
      amount: formatMoney(transaction.amount),
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("historyTitle")}</Text>

        <FlatList
          data={transactions}
          keyExtractor={item => String(item.id)}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.text}>{formatRow(item)}</Text>
              <Text style={styles.time}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t("historyEmpty")}</Text>
          }
        />
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
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    lineHeight: 20,
  },
})
