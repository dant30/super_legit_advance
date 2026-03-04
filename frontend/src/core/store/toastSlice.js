import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  queue: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    enqueueToast(state, action) {
      const payload = action.payload || {};
      const id = payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      state.queue.push({
        id,
        message: payload.message || "Done",
        variant: payload.variant || "info",
        duration: payload.duration ?? 3000,
      });
    },
    dismissToast(state, action) {
      const id = action.payload;
      state.queue = state.queue.filter((item) => item.id !== id);
    },
    clearToasts(state) {
      state.queue = [];
    },
  },
});

export const { enqueueToast, dismissToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;
