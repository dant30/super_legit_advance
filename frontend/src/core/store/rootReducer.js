import { combineReducers } from "@reduxjs/toolkit";

import toastReducer from "./toastSlice";
import { authReducer } from "../../features/auth/store";

const rootReducer = combineReducers({
  auth: authReducer,
  toast: toastReducer,
});

export default rootReducer;
