import {
  store,
  userInfoActions,
  currentServiceActions,
  currentBillerActions,
  paymentDataActions,
} from "../Redux/store";
import { addToQuickPay, deleteFromQuickPay } from "./apiCalls";
import { tools } from "./generalUtils";

// ----------------------------------------------------------------
const redux = (slice) => {
  // to get updated slice
  return store.getState()[slice].value;
};
// ----------------------------------------------------------------

const monthsNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const handleURL = (channel_id) => {
  switch (channel_id) {
    case 1:
      return "/contact-reorder";
    case 2:
      return "/aman-reorder";
    case 3:
      return "/khales-reorder";
    default:
  }
};

export const getOrderStatus = (orderStatus, transactionStatus) => {
  let status;
  if (
    (orderStatus === "PAID" && transactionStatus === "accounting_success") ||
    (orderStatus === "PAID" && transactionStatus === "accounting_failure")
  ) {
    status = "SUCCESS";
  } else if (orderStatus === "PAID" && transactionStatus === "card_refunded") {
    status = "REFUNDED";
  } else if (orderStatus === "REFUNDED" && transactionStatus === "deleted") {
    status = "REFUNDED";
  } else {
    status = "FAILED";
  }
  return status;
};

export const handleTransactionDate = (date) => {
  const fullDate = new Date(date);
  return `${fullDate.getDate()} ${
    monthsNames[fullDate.getMonth()]
  } ${fullDate.getFullYear()} `;
};

export const handleNavToFetchOrderDetailsAndInquiry = (
  // transaction = null,
  order,
  transaction
) => {
  updateReduxCurrentBillerAndService(
    transaction?.biller_service?.payment_channel_id,
    order,
    transaction
  );
  const url = handleURL(transaction?.biller_service?.payment_channel_id);
  tools.navigate(url);
};
//*

const updateReduxCurrentBillerAndService = (channel_id, order, transaction) => {
  let billerDetails;
  let serviceDetails;
  let paymentDetails;
  switch (channel_id) {
    //* contact ----------------------------------------------------------------
    case 1:
      billerDetails = {
        name: transaction.biller_service.biller.name,
        image_url: transaction.biller_service.biller.image_url,
      };
      serviceDetails = {
        biller_category_id:
          transaction?.biller_service?.biller?.biller_category?.id,
        biller_id: transaction?.biller_service?.biller?.id,
        code: transaction?.biller_service?.code,
        id: transaction?.biller_service?.id,
        serviceName: transaction?.biller_service?.name,
        image: transaction?.biller_service?.image_url,
        total_amount: transaction?.total_amount,
        receipt_num: transaction?.receipt_num,
        status: getOrderStatus(order?.status, transaction?.status),
        updated_at: transaction?.updated_at,
        billerCatName:
          transaction?.biller_service?.biller?.biller_category?.name,
        transaction: transaction,
      };
      paymentDetails = {
        billingAccount: transaction?.biller_client_national_id,
        billingAmount: transaction?.amount,
      };
      store.dispatch(currentBillerActions.update(billerDetails));
      store.dispatch(currentServiceActions.update(serviceDetails));
      store.dispatch(paymentDataActions.update(paymentDetails));

      break;
    //* aman ----------------------------------------------------------------
    case 2:
      billerDetails = {
        name: transaction.biller_service.biller.name,
        image_url: transaction.biller_service.biller.image_url,
      };
      serviceDetails = {
        extra_data: transaction?.biller_service?.extra_data,
        payment_type: transaction?.biller_service?.payment_type,
        biller_category_id:
          transaction?.biller_service?.biller?.biller_category?.id,
        biller_id: transaction?.biller_service?.biller?.id,
        code: transaction?.biller_service?.code,
        id: transaction?.biller_service?.id,
        serviceName: transaction?.biller_service?.name,
        image: transaction?.biller_service?.image_url,
        // amount:
        //   transaction?.biller_service?.payment_type === "PAY"
        //     ? null
        //     : transaction?.amount,
        receipt_num: transaction?.receipt_num,
        status: getOrderStatus(order?.status, transaction?.status),
        updated_at: transaction?.updated_at,
        billerCatName:
          transaction?.biller_service?.biller?.biller_category?.name,
        transaction: transaction,
      };
      paymentDetails = {
        billingAccount: transaction?.biller_client_national_id, // biller_client_national_id => is the billing account but returned with different name
        billingTotalAmount: Number(transaction?.total_amount),
        billingAmount:
          // aman => "PAY" (no amount needed) | "TOPUP" | "NGO"
          transaction?.biller_service?.payment_type === "PAY"
            ? null
            : Number(transaction?.amount),
      };
      store.dispatch(currentBillerActions.update(billerDetails));
      store.dispatch(currentServiceActions.update(serviceDetails));
      store.dispatch(paymentDataActions.update(paymentDetails));

      break;
    //* khales ----------------------------------------------------------------
    case 3:
      billerDetails = {
        name: transaction.biller_service.biller.name,
        image_url: transaction.biller_service.biller.image_url,
      };
      serviceDetails = {
        extra_data: transaction?.biller_service?.extra_data,
        payment_type: transaction?.biller_service?.payment_type,
        biller_category_id:
          transaction?.biller_service?.biller?.biller_category?.id,
        biller_id: transaction?.biller_service?.biller?.id,
        code: transaction?.biller_service?.code,
        id: transaction?.biller_service?.id,
        serviceName: transaction?.biller_service?.name,
        image: transaction?.biller_service?.image_url,
        account: transaction?.biller_client_national_id,
        total_amount: transaction?.total_amount,
        amount: transaction?.amount,
        receipt_num: transaction?.receipt_num,
        status: getOrderStatus(order?.status, transaction?.status),
        updated_at: transaction?.updated_at,
        billerCatName:
          transaction?.biller_service?.biller?.biller_category?.name,
        transaction: transaction,
      };
      paymentDetails = {
        billingAccount: transaction?.biller_client_national_id,
        billingAmount: transaction?.amount,
      };
      store.dispatch(currentBillerActions.update(billerDetails));
      store.dispatch(currentServiceActions.update(serviceDetails));
      store.dispatch(paymentDataActions.update(paymentDetails));

      break;
    default:
  }
};

export const HandleTransactionDate = (date) => {
  const fullDate = new Date(date);
  return `${fullDate.getDate()} ${
    monthsNames[fullDate.getMonth()]
  } ${fullDate.getFullYear()} `;
};
