import { createSlice } from "@reduxjs/toolkit";
import { CUSTOMER_INITIAL_STATE } from "../types";

const customersSlice = createSlice({
  name: "customers",
  initialState: CUSTOMER_INITIAL_STATE,
  reducers: {
    setCustomersState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setCustomers(state, action) {
      state.customers = action.payload || [];
    },
    setCustomersLoading(state, action) {
      state.customersLoading = Boolean(action.payload);
    },
    setSelectedCustomer(state, action) {
      state.selectedCustomer = action.payload || null;
    },
    setGuarantors(state, action) {
      state.guarantors = action.payload || [];
    },
    setCustomerStats(state, action) {
      state.stats = action.payload || null;
    },
    setCustomerFilters(state, action) {
      state.filters = action.payload || {};
    },
    resetCustomersState() {
      return CUSTOMER_INITIAL_STATE;
    },
  },
});

export const {
  setCustomersState,
  setCustomers,
  setCustomersLoading,
  setSelectedCustomer,
  setGuarantors,
  setCustomerStats,
  setCustomerFilters,
  resetCustomersState,
} = customersSlice.actions;

export default customersSlice.reducer;
