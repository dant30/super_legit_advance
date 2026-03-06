import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import rootReducer from "../../../core/store/rootReducer";
import {
  selectDashboardCustomers,
  selectDashboardOverview,
} from "../../../features/dashboard/store";
import {
  setDashboardCustomers,
  setOverview,
} from "../../../features/dashboard/store/dashboardSlice";

describe("dashboard store integration", () => {
  it("registers dashboard reducer and persists dispatched dashboard state", () => {
    const store = configureStore({ reducer: rootReducer });

    store.dispatch(setOverview({ customers: 5, activeLoans: 2, dueToday: 1, collectionRate: 75 }));
    store.dispatch(setDashboardCustomers([{ id: "cus-1" }]));

    const state = store.getState();
    expect(state.dashboard).toBeDefined();
    expect(selectDashboardOverview(state)).toEqual({
      customers: 5,
      activeLoans: 2,
      dueToday: 1,
      collectionRate: 75,
    });
    expect(selectDashboardCustomers(state)).toEqual([{ id: "cus-1" }]);
  });
});

