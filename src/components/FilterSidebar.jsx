
import React from 'react'
import { X } from 'lucide-react'
import { categories, colors } from '../data/products.js'
import './FilterSidebar.css'

export default function FilterSidebar({
  filters,
  onCategoryToggle,
  onColorToggle,
  onPriceChange,
  onClear,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      <aside
        className={`filter-sidebar ${
          mobileOpen ? 'is-open' : ''
        }`}
      >

        {/* =========================================
            MOBILE HEADER
            ========================================= */}

        <div className="filter-sidebar-mobile-header mobile-only">

          <h3>Filters</h3>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>

        </div>

        {/* =========================================
            CATEGORY
            ========================================= */}

        <div className="filter-group">

          <div className="filter-group-header">

            <h4>Category</h4>

            <button
              type="button"
              className="filter-clear"
              onClick={onClear}
            >
              Clear all
            </button>

          </div>

          {categories.map((cat) => (

            <label
              key={cat.id}
              className="filter-checkbox"
            >

              <input
                type="checkbox"
                checked={filters.categories.includes(
                  cat.id
                )}
                onChange={() =>
                  onCategoryToggle(cat.id)
                }
              />

              <span>{cat.name}</span>

            </label>

          ))}

        </div>

        {/* =========================================
            PRICE
            ========================================= */}

        <div className="filter-group">

          <h4>Price</h4>

          <input
            type="range"
            min="300"
            max="1000"
            step="50"
            value={Math.min(
              Math.max(filters.maxPrice, 300),
              1000
            )}
            onChange={(e) =>
              onPriceChange(
                Number(e.target.value)
              )
            }
            className="filter-price-slider"
          />

          <div className="filter-price-labels">

            <span>₹300</span>

            <span>
              ₹
              {Number(
                filters.maxPrice
              ).toLocaleString('en-IN')}
            </span>

          </div>

        </div>

        {/* =========================================
            COLOR
            ========================================= */}

        <div className="filter-group">

          <h4>Color</h4>

          <div className="filter-colors">

            {colors.map((c) => {

              const isSelected =
                filters.colors.includes(c.id)

              return (

                <button
                  key={c.id}
                  type="button"
                  className={`filter-color-swatch ${
                    isSelected
                      ? 'is-active'
                      : ''
                  }`}
                  style={{
                    backgroundColor: c.hex,
                  }}
                  onClick={() =>
                    onColorToggle(c.id)
                  }
                  aria-label={`Filter by ${c.name}`}
                  title={c.name}
                />

              )
            })}

          </div>

          {/* SELECTED COLORS */}

          {filters.colors.length > 0 && (

            <div className="selected-color-names">

              {filters.colors.map((colorId) => {

                const selectedColor =
                  colors.find(
                    (color) =>
                      color.id === colorId
                  )

                return selectedColor ? (
                  <span
                    key={colorId}
                    className="selected-color-name"
                  >
                    {selectedColor.name}
                  </span>
                ) : null

              })}

            </div>

          )}

        </div>

        {/* =========================================
            MOBILE APPLY
            ========================================= */}

        <button
          type="button"
          className="btn btn-primary btn-block mobile-only"
          onClick={onCloseMobile}
        >
          Apply Filters
        </button>

      </aside>

      {/* =========================================
          MOBILE OVERLAY
          ========================================= */}

      {mobileOpen && (
        <div
          className="filter-sidebar-overlay mobile-only"
          onClick={onCloseMobile}
        />
      )}

    </>
  )
}


