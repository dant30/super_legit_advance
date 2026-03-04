import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== "production",
});

export default store;
