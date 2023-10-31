import axios from "axios";
import { baseUrl } from "./baseUrl";
import { store } from "../Redux/store";
import { tools } from "./generalUtils";

// ----------------------------------------------------------------
const redux = (slice) => {
  // to get updated slice
  return store.getState()[slice].value;
};
// ----------------------------------------------------------------

//* get all (categories => inner billers => inner services)
export const getAllCategoriesBillersServices = async () => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/billers-categories/billers/list`, {})
    .then((res) => {
      returnedValue = res.data.data.filter(
        (service) => service.id !== 1 && service.id !== 9
      );
    })
    .catch((err) => {
      //   if (err.statusCode === 403 && err.message === "Forbidden resource") {
      //     returnedValue = <Forbidden />;
      //   }
      throw new Error(err); // caught by .then() // stop code execution, and throw error to be caught
    });
  return returnedValue; // caught by .then()
};

//* get user information
//^ receive [phone] only
export const getUserInfo = async (phoneNumber) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/clients/get`, {
      phone_number: phoneNumber,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      // throw new Error(err);
    });
  return returnedValue;
};

//* add user
//^ receive [phone] [national id => optional] [name => optional]
//^ if client present, return his id
//^ if not present, add him to DB, and return his created id
export const addUser = async (phoneNumber, nationalId, name) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/clients/add`, {
      phone_number: phoneNumber,
      national_id: nationalId, // optional
      name: name, // optional
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* get user history
export const getUserHistory = async () => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/clients/history`, {
      client_id: redux("userInfo").id,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      returnedValue = err;
      console.log(err);
    });
  return returnedValue;
};

//* add service to quick pay
export const addToQuickPay = async (
  aliasName,
  // serviceName,
  billingAccount,
  serviceCode
) => {
  let returnedValue;
  // ---------------
  const serviceName =
    tools.locale === "en"
      ? redux("currentService")?.serviceName?.en
      : redux("currentService")?.serviceName?.ar;
  // ---------------
  await axios
    .post(`${baseUrl.production}/clients/quick-pay/add`, {
      client_id: redux("userInfo").id,

      billing_account: billingAccount || redux("paymentData").billingAccount,

      service_code: serviceCode || redux("currentService").code,
      alias_name: aliasName || serviceName,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* delete service from quick pay
export const deleteFromQuickPay = async (quickPayServiceUuid) => {
  let returnedValue;
  await axios
    .delete(`${baseUrl.production}/clients/quick-pay/delete`, {
      data: {
        client_id: redux("userInfo").id,
        uuid: quickPayServiceUuid,
      },
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* 1) fetch enquiry
export const fetchEnquiry = async (
  serviceType, // mandatory // for both currentService or multiPay
  // --------------for quickpay------------------
  serviceCode,
  billingAccount,
  billingAmount,
  // new
  additionalData,
  DateFrom,
  DateTo
) => {
  // sources ----------------
  let dateFrom = DateFrom || redux("currentService").DateFrom;
  let dateTo = DateTo || redux("currentService").DateTo;
  // ------------------------

  console.log("bbbbbbbbbbb", dateFrom, dateFrom);
  // if all requirements are passed, will inject them
  // if service type is only passed, will read requirements from current service slice
  let requestBody;
  switch (serviceType) {
    case "aman": // aman is only one type
      requestBody = {
        reqBody: {
          serviceCode: serviceCode || redux("currentService").code,
          billingAccount: billingAccount || redux("paymentData").billingAccount,
          amount: billingAmount || redux("paymentData").billingAmount || null, // aman post paid = null
        },
        serviceType,
      };
      break;
    case "khales_prepaid": // khales contains two types
    case "khales_postpaid":
      requestBody = {
        reqBody: {
          serviceCode: serviceCode || redux("currentService").code,
          billingAccount: billingAccount || redux("paymentData").billingAccount,
          additionalData:
            additionalData || redux("currentService").additionalData,
          // {
          //   [amountName ||
          //   redux("currentService").extra_data.additionalInfo[0].name]:
          //     Number(amount) || redux("paymentData").billingAmount,
          // }, // amountName => "amount" || "count" //! Number(amount) => change input to be number input
          DateFrom:
            dateFrom === "false" ? dateFrom : new Date(dateFrom).toISOString(),
          // (redux("currentService").DateFrom === "false"
          //   ? redux("currentService").DateFrom
          //   : new Date(redux("currentService").DateFrom).toISOString()),
          DateTo:
            (dateTo === "false" ? dateTo : new Date(dateTo).toISOString()) ||
            (redux("currentService").DateTo === "false"
              ? redux("currentService").DateTo
              : new Date(redux("currentService").DateTo).toISOString()),

          // DateFrom: redux("currentService").DateFrom, // updated above
          // DateTo: redux("currentService").DateTo,
        },
        serviceType,
      };
      break;
  }

  let returnedValue;
  await axios
    .post(`${baseUrl.production}/contact-service/v2/enquiry`, {
      ...requestBody,
    })
    .then((res) => {
      console.log(res);
      returnedValue = res.data;
    })
    .catch((err) => {
      console.log(err);
      throw new Error(err);
    });
  return returnedValue;
};

//* 2) generate transactionReceiptNum
// data => quick pay
export const transactionReceiptNumGenerator = async (serviceType, data) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/order-transactions/payment`, {
      ...bodyGenerator(serviceType, data),
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* 3) request url => cowpay
export const requestUrlToken = async (receiptNumber) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/payment_method/request-url`, {
      receipt_number: Number(receiptNumber),
      // payment_method_id: redux("paymentData").enquiryResult.paymentMethodId, // => 1 => cowpay
      payment_method_id: 2, // paymob
      client_id: redux("userInfo").id,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* 3) request url => paymob
export const requestUrl = async (receiptNumber) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/payment_method/request-url`, {
      receipt_number: Number(receiptNumber),
      // payment_method_id: redux("paymentData").enquiryResult.paymentMethodId, // => 1 => cowpay
      payment_method_id: 2, // paymob
      client_id: redux("userInfo").id,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

//* 3) request url => multipay
export const requestUrlTokenMultiPay = async (receiptNumbers) => {
  console.log(receiptNumbers);
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/payment_method/request-url-multi`, {
      receipt_numbers: receiptNumbers,
      // payment_method_id: redux("paymentData").enquiryResult.paymentMethodId,
      payment_method_id: +1,
      client_id: redux("userInfo").id,
    })

    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  console.log(returnedValue);

  return returnedValue;
};

//* get service details
export const getServiceDetails = async () => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/billers-services`, {
      code: redux("currentService").code,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};
//* get service details
//^ receive array of services codes => return more details about them
//^ side effect: remove duplicates
export const getServicesDetails = async (servicesCodes, withRelation) => {
  let returnedValue;
  await axios
    .post(`${baseUrl.production}/billers-services/searchMany`, {
      serviceCodes: servicesCodes,
      withRelation,
    })
    .then((res) => {
      returnedValue = res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return returnedValue;
};

// !
const bodyGenerator = (serviceType, data) => {
  //& data => for multi pay
  // data: enquiry result mixed with details of this quick pay service (instead of current service, as there's no current service in multipay)
  //& current service => for single service
  let cs = redux("currentService");
  //& enquiry result => for single service
  let er = redux("paymentData").enquiryResult;
  // chosen source --------------------------------------------------
  let enquiry = data?.enquiry || er; // need only er from data
  let serviceCode = data?.code || cs.code;
  let EPayBillRecID = data?.EPayBillRecID || er.EPayBillRecID;
  let billNumber = data?.billNumber || er.billNumber;
  let amount = Number(data?.amount) || Number(er.amount);
  let fees = Number(data?.feesAmount) || Number(er.feesAmount);
  let uuid = enquiry.uuid;
  let BillRefInfo = data?.BillRefInfo || er.BillRefInfo;
  let khalesPaymentSequence =
    data?.khalesPaymentSequence || er.khalesPaymentSequence;
  let khalesEnquiryRefSignedData =
    data?.khalesEnquiryRefSignedData || er.khalesEnquiryRefSignedData;
  let dateTo = data?.DateTo || cs.DateTo;
  let dateFrom = data?.DateFrom || cs.DateFrom;
  let attachedLogId = data?.attachedLogId || er.attachedLogId;
  let vat = data?.vat || er.vat;
  let billerDetails = data?.billerDetails || er.billerDetails;

  switch (serviceType) {
    case "aman":
      return {
        reqBody: {
          ...enquiry,
          // paymentMethodId: 1, // cowpay
          paymentMethodId: 2, // paymob
        },
        serviceType,
      };
    case "khales_payment":
      //todo: will need (?.) to skip 1st option if not present
      return {
        reqBody: {
          serviceCode,
          EPayBillRecID,
          billingAccount:
            (cs.code === "55570" ? cs.account : er.customerData.customerCode) ||
            (data.code === "55570"
              ? data.account
              : data.customerData.customerCode),
          billNumber,
          amount,
          fees,
          // uuid: data.uuid || er.uuid, // quickPay service uuid
          uuid, // enquiry.uuid => as here we need the enquiry uuid (not quickPay service uuid => data.uuid || er.uuid)
          BillRefInfo,
          khalesPaymentSequence,
          khalesEnquiryRefSignedData,
          DateTo:
            dateTo === "false"
              ? dateTo // "false"
              : new Date(dateTo).toISOString(),
          DateFrom:
            dateFrom === "false"
              ? dateFrom // "false"
              : new Date(dateFrom).toISOString(),
          //new------------
          attachedLogId: Number(attachedLogId),
          vat: String(vat),
          // paymentMethodId: 1, // cowpay
          paymentMethodId: 2, // paymob
          billerDetails,
        },
        serviceType: serviceType,
      };
  }
};

// export const urlRequestultiPay = async (oldReqBody) => {
//   try {
//     const { signature, body } = await generateSignatureAndBody(oldReqBody);

//     const res = await axios.post(
//       `${baseUrl.production}/payment_method/request-url-multi`,
//       body,
//       {
//         auth: auth,
//         headers: {
//           "cp-signature": signature,
//         },
//       }
//     );
//     return res.data;
//   } catch (error) {}
// };
