import { combineReducers } from "@reduxjs/toolkit";

import toastReducer from "./toastSlice";
import { authReducer } from "../../features/auth/store";
import { customersReducer } from "../../features/customers/store";
import { loansReducer } from "../../features/loans/store";
import { notificationsReducer } from "../../features/notifications/store";
import { repaymentsReducer } from "../../features/repayments/store";

const rootReducer = combineReducers({
  auth: authReducer,
  customers: customersReducer,
  loans: loansReducer,
  notifications: notificationsReducer,
  repayments: repaymentsReducer,
  toast: toastReducer,
});

export default rootReducer;
