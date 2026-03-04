import { combineReducers } from "@reduxjs/toolkit";

import toastReducer from "./toastSlice";
import { authReducer } from "../../features/auth/store";
import { customersReducer } from "../../features/customers/store";

const rootReducer = combineReducers({
  auth: authReducer,
  customers: customersReducer,
  toast: toastReducer,
});

export default rootReducer;
