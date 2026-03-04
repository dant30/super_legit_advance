import { combineReducers } from "@reduxjs/toolkit";

import toastReducer from "./toastSlice";

const rootReducer = combineReducers({
  toast: toastReducer,
});

export default rootReducer;
