import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'sarika_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ============================================================
  // POP-UP STATE
  // ============================================================

  const [addedItem, setAddedItem] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  // ============================================================
  // SAVE CART TO LOCAL STORAGE
  // ============================================================

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    )
  }, [items])

  // ============================================================
  // ADD TO CART (Triggers Pop-up)
  // ============================================================

  const addToCart = (
    product,
    quantity = 1,
    color = null,
    skipPopup = false
  ) => {
    setItems((prev) => {
      const key = `${product.id}-${color || 'default'}`

      const existing = prev.find(
        (i) => i.key === key
      )

      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? {
                ...i,
                quantity:
                  i.quantity + quantity,
              }
            : i
        )
      }

      return [
        ...prev,
        {
          key,

          id: product.id,

          name: product.name,

          price: product.price,

          originalPrice:
            product.originalPrice,

          image: product.image,

          variant: product.variant,

          color,

          quantity,
        },
      ]
    })

    // Open the pop-up modal with the added product
    if (!skipPopup) {
      setAddedItem({
        ...product,
        quantity,
        color,
      })
      setShowPopup(true)
    }
  }

  // ============================================================
  // CLOSE POP-UP
  // ============================================================

  const closePopup = () => {
    setShowPopup(false)
  }

  // ============================================================
  // REMOVE FROM CART
  // ============================================================

  const removeFromCart = (key) => {
    setItems((prev) =>
      prev.filter((i) => i.key !== key)
    )
  }

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const updateQuantity = (
    key,
    quantity
  ) => {
    if (quantity < 1) return

    setItems((prev) =>
      prev.map((i) =>
        i.key === key
          ? {
              ...i,
              quantity,
            }
          : i
      )
    )
  }

  // ============================================================
  // CLEAR CART
  // ============================================================

  const clearCart = () => {
    setItems([])
  }

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum +
          Number(i.price) *
            Number(i.quantity),
        0
      ),
    [items]
  )

  // ============================================================
  // SHIPPING (₹75 FLAT RATE)
  // ============================================================

  const shipping =
    subtotal > 0 ? 75 : 0

  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    subtotal + shipping

  // ============================================================
  // ITEM COUNT
  // ============================================================

  const itemCount =
    items.reduce(
      (sum, i) =>
        sum + Number(i.quantity),
      0
    )

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    items,

    addToCart,

    removeFromCart,

    updateQuantity,

    clearCart,

    subtotal,

    shipping,

    total,

    itemCount,

    showPopup,

    addedItem,

    closePopup,
  }

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  )
}

// ============================================================
// USE CART HOOK
// ============================================================

export const useCart = () => {
  const ctx = useContext(
    CartContext
  )

  if (!ctx) {
    throw new Error(
      'useCart must be used within CartProvider'
    )
  }

  return ctx
}