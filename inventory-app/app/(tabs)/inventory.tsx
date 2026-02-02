import React, { createContext, useContext, useMemo, useState } from "react";

export type Product = {
  id: number;
  name: string;
  qty: number;
  price: number;
  cost: number;
};

type InventoryContextValue = {
  products: Product[];
  revenue: number;
  expenses: number;
  profit: number;
  addProduct: (p: { name: string; qty: number; price: number; cost: number }) => void;
  sellOne: (id: number) => void;
  restockOne: (id: number) => void;
  wasteOne: (id: number) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);

  const addProduct: InventoryContextValue["addProduct"] = (p) => {
    if (!p.name.trim()) return;

    setProducts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: p.name.trim(),
        qty: Math.max(0, Math.floor(p.qty)),
        price: p.price,
        cost: p.cost,
      },
    ]);
  };

  const sellOne = (id: number) => {
    setProducts(prev => {
      const target = prev.find(x => x.id === id);
      if (!target || target.qty <= 0) return prev;

      setRevenue(r => r + target.price);
      return prev.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x);
    });
  };

  const restockOne = (id: number) => {
    setProducts(prev => {
      const target = prev.find(x => x.id === id);
      if (!target) return prev;

      setExpenses(e => e + target.cost);
      return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x);
    });
  };

  const wasteOne = (id: number) => {
    setProducts(prev => {
      const target = prev.find(x => x.id === id);
      if (!target || target.qty <= 0) return prev;

      return prev.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x);
    });
  };

  const value = useMemo(() => ({
    products,
    revenue,
    expenses,
    profit: revenue - expenses,
    addProduct,
    sellOne,
    restockOne,
    wasteOne,
  }), [products, revenue, expenses]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}
