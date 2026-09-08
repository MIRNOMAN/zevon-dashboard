import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Product } from "@/features/products";
import { RootState } from "../store";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ProductState {
  selectedProduct: Product | null;
}

const initialState: ProductState = {
  selectedProduct: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const { selectProduct, clearSelectedProduct } = productSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectCurrentProduct = (state: RootState) =>
  state.products.selectedProduct;

// ---------------------------------------------------------------------------
// Reducer export
// ---------------------------------------------------------------------------

export default productSlice.reducer;
