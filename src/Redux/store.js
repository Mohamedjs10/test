import { createSlice, configureStore } from "@reduxjs/toolkit";
//* slices -------------------------------------------------------------------------------------------
//& user information
const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: { value: null },
  reducers: {
    update(state, action) {
      state.value = action.payload;
    },
    addServiceToUserQuickPay(state, action) {
      state.value.quick_pay = [...state.value.quick_pay, action.payload];
    },
    removeServiceFromUserQuickPay(state, action) {
      const filterQuickPay = state.value.quick_pay.filter(
        (service) => service.service_code !== action.payload
      );
      state.value.quick_pay = filterQuickPay;
    },
  },
});
//& all data (categories => billers => services)
const allCategoriesBillersServicesSlice = createSlice({
  name: "allCategoriesBillersServices",
  initialState: { value: null },
  reducers: {
    update(state, action) {
      state.value = action.payload;
    },
  },
});
//& current biller
const currentBillerSlice = createSlice({
  name: "currentBiller",
  initialState: { value: null },
  reducers: {
    update(state, action) {
      state.value = action.payload;
    },
  },
});
//& current service
const currentServiceSlice = createSlice({
  name: "currentService",
  // initialState: { value: null },
  initialState: { value: {} },
  reducers: {
    // update(state, action) {
    //   state.value = action.payload;
    // },
    update(state, action) {
      state.value = { ...state.value, ...action.payload };
    },
  },
});
//& payment data
const paymentDataSlice = createSlice({
  name: "paymentData",
  initialState: {
    value: {
      billingAccount: null,
      billingAmount: null,
      billingTotalAmount: null,
      enquiryResult: null,
      paymentData: null,
    },
  },
  reducers: {
    update(state, action) {
      state.value = { ...state.value, ...action.payload };
    },
  },
});
//& history orders
const historyOrdersSlice = createSlice({
  name: "historyOrders",
  initialState: { value: null },
  reducers: {
    update(state, action) {
      state.value = action.payload;
    },
  },
});
//& quick pay
const quickPaySlice = createSlice({
  name: "quickPay",
  initialState: {
    value: {
      multiPay: {
        // ----------------------
        postpaidServicesEnquiries: [], //2 => [] => fix all into (postpaidServicesEnquiries.length), not (postpaidServicesEnquiries) only as when was null
        checkedPostpaidServicesEnquiries: [], //3
        checkedPostpaidServicesEnquiriesTotalAmount: 0, //4
        // ----------------------
        prepaidServicesForms: null, //1 => []
        prepaidServicesEnquiries: null, //2 => []
        checkedPrepaidServicesEnquiries: [], //3
        checkedPrepaidServicesEnquiriesTotalAmount: 0, //4
      },
    },
  },
  reducers: {
    update(state, action) {
      let array, service, purpose;
      // ---------------
      switch (action.payload.type) {
        case "postpaidServicesEnquiries": //2
          array = [...state.value.multiPay.postpaidServicesEnquiries];
          service = action.payload.value;
          purpose = action.payload.action;

          switch (purpose) {
            case "set":
              state.value.multiPay.postpaidServicesEnquiries =
                action.payload.value;
              break;
            case "add":
              state.value.multiPay.postpaidServicesEnquiries.push(service);
              break;
            case "remove":
              let arrayWithoutDispatchedService = array.filter((item) => {
                return item.uuid !== service.uuid;
              });
              state.value.multiPay.postpaidServicesEnquiries =
                arrayWithoutDispatchedService;
              break;
          }
          break;

        case "checkedPostpaidServicesEnquiries": //3
          array = [...state.value.multiPay.checkedPostpaidServicesEnquiries];
          service = action.payload.value;
          purpose = action.payload.action;

          switch (purpose) {
            case "set":
              console.log("set");
              state.value.multiPay.checkedPostpaidServicesEnquiries =
                action.payload.value;
              break;
            case "add":
              state.value.multiPay.checkedPostpaidServicesEnquiries.push(
                service
              );
              break;
            case "remove":
              let arrayWithoutDispatchedService = array.filter((item) => {
                return item.uuid !== service.uuid;
              });
              state.value.multiPay.checkedPostpaidServicesEnquiries =
                arrayWithoutDispatchedService;
              break;
          }

          break;
        case "checkedPostpaidServicesEnquiriesTotalAmount": //4
          state.value.multiPay.checkedPostpaidServicesEnquiriesTotalAmount +=
            action.payload.value;
          break;
        // ----------------------
        case "prepaidServicesForms": //1
          state.value.multiPay.prepaidServicesForms = action.payload.value;
          break;
        //
        case "prepaidServicesEnquiries": //2
          state.value.multiPay.prepaidServicesEnquiries = action.payload.value;
          break;
        case "checkedPrepaidServicesEnquiries": //3
          array = [...state.value.multiPay.checkedPrepaidServicesEnquiries];
          service = action.payload.value;
          purpose = action.payload.action;

          switch (purpose) {
            case "set":
              state.value.multiPay.checkedPrepaidServicesEnquiries = service;
              break;
            case "add":
              state.value.multiPay.checkedPrepaidServicesEnquiries.push(
                service
              );
              break;
            case "remove":
              let arrayWithoutDispatchedService = array.filter((item) => {
                return item.uuid !== service.uuid;
              });
              state.value.multiPay.checkedPrepaidServicesEnquiries =
                arrayWithoutDispatchedService;
              break;
          }

          break;
        case "checkedPrepaidServicesEnquiriesTotalAmount": //4
          purpose = action.payload.action;
          switch (purpose) {
            case "set":
              state.value.multiPay.checkedPrepaidServicesEnquiriesTotalAmount =
                action.payload.value;
              break;
            case "update":
              state.value.multiPay.checkedPrepaidServicesEnquiriesTotalAmount +=
                action.payload.value;
              break;
          }
          break;
      }
    },
  },
});
//* store configuration --------------------------------------------------------------------------------
export const store = configureStore({
  reducer: {
    userInfo: userInfoSlice.reducer,
    allCategoriesBillersServices: allCategoriesBillersServicesSlice.reducer,
    currentBiller: currentBillerSlice.reducer,
    currentService: currentServiceSlice.reducer,
    paymentData: paymentDataSlice.reducer,
    historyOrders: historyOrdersSlice.reducer,
    quickPay: quickPaySlice.reducer,
  },
});

//* actions exports --------------------------------------------------------------------------------
export const userInfoActions = userInfoSlice.actions;
export const allCategoriesBillersServicesActions =
  allCategoriesBillersServicesSlice.actions;
export const currentBillerActions = currentBillerSlice.actions;
export const currentServiceActions = currentServiceSlice.actions;
export const paymentDataActions = paymentDataSlice.actions;
export const historyOrdersActions = historyOrdersSlice.actions;
export const quickPayActions = quickPaySlice.actions;

export default store;
