
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'sarika_wishlist'

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return []
      }

      const parsed = JSON.parse(saved)

      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Wishlist loading error:', error)
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Wishlist saving error:', error)
    }
  }, [items])

  const isWishlisted = (id) => {
    return items.some(
      (item) => String(item.id) === String(id)
    )
  }

  const toggleWishlist = (product) => {
    if (!product || product.id == null) {
      return
    }

    setItems((previousItems) => {
      const exists = previousItems.some(
        (item) => String(item.id) === String(product.id)
      )

      if (exists) {
        return previousItems.filter(
          (item) => String(item.id) !== String(product.id)
        )
      }

      return [
        ...previousItems,
        {
          id: product.id,
          name: product.name || 'Saree',
          price: Number(product.price) || 0,
          originalPrice:
            product.originalPrice != null
              ? Number(product.originalPrice)
              : Number(product.price) || 0,
          image:
            product.image ||
            product.images?.[0] ||
            '',
          variant: product.variant || 0,
        },
      ]
    })
  }

  const removeFromWishlist = (id) => {
    setItems((previousItems) =>
      previousItems.filter(
        (item) => String(item.id) !== String(id)
      )
    )
  }

  const clearWishlist = () => {
    setItems([])
  }

  const value = {
    items,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    count: items.length,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error(
      'useWishlist must be used inside WishlistProvider'
    )
  }

  return context
}

