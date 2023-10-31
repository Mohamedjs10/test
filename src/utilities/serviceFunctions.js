import {
  store,
  userInfoActions,
  currentServiceActions,
  paymentDataActions,
  quickPayActions,
} from "../Redux/store";
import { addToQuickPay, deleteFromQuickPay, fetchEnquiry } from "./apiCalls";
import i18n from "../locals/i18n";
import { ArrowSwapHorizontal } from "iconsax-react";
import Box from "@mui/material/Box";
import { MoneySend } from "iconsax-react";

import { tools } from "./generalUtils";
// ----------------------------------------------------------------

// ----------------------------------------------------------------
const redux = (slice) => {
  // to get updated slice
  return store.getState()[slice].value;
};
// ----------------------------------------------------------------
export const servicePageRoute = (channelId) => {
  switch (channelId) {
    case 2:
      return "/aman-form";
    case 3:
      return "/khales-form";
    case 1:
      return "/contact-form";
  }
};

export const dispatchToServiceSlice = (service) => {
  let serviceDetails;
  switch (service.payment_channel_id) {
    case 2:
      serviceDetails = {
        biller_category_id: service.biller_category_id,
        biller_id: service.biller_id,
        code: service.code,
        extra_data: service.extra_data,
        id: service.id,
        serviceName: service.name,
        payment_type: service.payment_type,
        image: service.image_url,
      };
      store.dispatch(currentServiceActions.update(serviceDetails));

      break;
    case 3:
      serviceDetails = {
        biller_category_id: service.biller_category_id,
        biller_id: service.biller_id,
        code: service.code,
        extra_data: service.extra_data,
        id: service.id,
        serviceName: service.name,
        payment_type: service.payment_type,
        image: service.image_url,
      };
      store.dispatch(currentServiceActions.update(serviceDetails));

      break;
    case 1:
      serviceDetails = {
        biller_category_id: service.biller_category_id,
        biller_id: service.biller_id,
        code: service.code,
        id: service.id,
        serviceName: service.name,
        image: service.image_url,
      };
      store.dispatch(currentServiceActions.update(serviceDetails));
      break;
    default:
  }
};

//^ any service has a unique serviceCode
//^ but we can add the same service multiple time in quick pay => so => serviceCode can't be be used as a unique value in quick pay => so
//^ so, only in quick pay services, each service has a (uuid) to make each service has a unique identifier

//* check if this service is in quick pay
export const isInQuickPay = (serviceCode) => {
  // check if this service present at least once in quick pay
  return redux("userInfo").quick_pay.some(
    ({ service_code }) => service_code === serviceCode
  );
};

//* add service to (1- DB quick pay) + (2-Redux quick pay)

export const addQuickPayService = async (
  aliasName,
  // serviceName, //not needed // in service toggle: alternative is current service name from redux | in quick pay : alias name ust be entered | so serviceName won't never be sent as parameter
  billingAccount,
  serviceCode
) => {
  //& 1) add to DB
  //todo: review inputs
  await addToQuickPay(
    aliasName,
    // serviceName,
    billingAccount,
    serviceCode
  )
    .then((res) => {
      //& 2) add to Redux
      // ---------------
      const serviceName =
        tools.locale === "en"
          ? redux("currentService")?.serviceName?.en
          : redux("currentService")?.serviceName?.ar;
      // ---------------
      store.dispatch(
        userInfoActions.addServiceToUserQuickPay({
          // data I need to be in quick pay services (better: ask backend to get all service details back instead of uuid only)
          uuid: res.quick_pay_uuid,
          client_id: redux("userInfo").id,
          billing_account:
            billingAccount || redux("paymentData").billingAccount,
          service_code: serviceCode || redux("currentService").code,
          alias_name: aliasName || serviceName,
        })
      );
    })
    .catch((err) => console.error(err));
};

//* remove service from (1- DB quick pay) + (2-Redux quick pay)
export const removeQuickPayService = (serviceCode) => {
  //& 1) remove all services that has the same serviceCode from DB (better: remove by service code to avoid all this hassle)
  const filteredQuickPayServices = redux("userInfo").quick_pay.filter(
    (quickPayService) => quickPayService.service_code === serviceCode
  );
  const promisesArray = filteredQuickPayServices.map((quickPayService) => {
    return deleteFromQuickPay(quickPayService.uuid);
  });

  Promise.all(promisesArray) // [promise1, promise2]
    .then((values) => {
      console.log(values); // [resolvedValue1, resolvedValue2]
      //& 2) remove all services that has the same serviceCode from Redux
      store.dispatch(
        userInfoActions.removeServiceFromUserQuickPay(serviceCode)
      );
    })
    .catch((error) => {
      console.log(error); // rejectReason of any first rejected promise
    });
};

export const runFetchEnquiry = async (
  // for single service => made for all in the future
  serviceType,
  setErrorMessage,
  setErrorAlert,
  setIsEnquiryLoading,
  // --------------for quickpay only------------------
  service,
  setIsChecked,
  setPrepaidEnquiryResult,
  serviceCode,
  billingAccount,
  billingAmount,
  additionalData,
  DateFrom,
  DateTo
) => {
  await fetchEnquiry(
    serviceType,
    serviceCode,
    billingAccount,
    billingAmount,
    additionalData,
    DateFrom,
    DateTo
  )
    .then((res) => {
      console.log(res);
      console.log(res.message);
      // res => prepaidEnquiryResult
      // if (res.statusCode == 400) {
      //   console.log("from inside", res.message);

      //   setErrorMessage(res.message);
      // }
      if (res.uuid) {
        console.log("xxxxxxxx");
        // if there in not error (as error message returned in then, as successful) for both aman and khales
        // uuid is present in the enquiry response of both aman and khales
        //* single service
        store.dispatch(
          paymentDataActions.update({
            enquiryResult: {
              ...res,
              paymentMethodId: 1, // cowpay payment method
            },
          })
        );
        //* multiPay service
        store.dispatch(
          quickPayActions.update({
            type: "checkedPrepaidServicesEnquiries",
            value: { ...res, ...service },
            action: "add",
          })
        );
        let totalAmount =
          Number(res?.totalAmount) || Number(res?.overallPayment);
        store.dispatch(
          quickPayActions.update({
            type: "checkedPrepaidServicesEnquiriesTotalAmount",
            value: totalAmount,
            action: "update",
          })
        );
        setPrepaidEnquiryResult && setPrepaidEnquiryResult(res);
        setErrorMessage && setErrorMessage("");
        setIsChecked && setIsChecked(true);

        // TODO: check
      } else if (res === "ECONNABORTED") {
        console.log("xxxxxxxx");

        setErrorAlert && setErrorAlert(true);
        setErrorMessage && setErrorMessage(tools.t("global.timeOutError"));
      } else if (res.error || res.message) {
        console.log("xxxxxxxx");

        setErrorAlert && setErrorAlert(true);
        setErrorMessage &&
          setErrorMessage(
            (tools?.locale === "en" ? res.message?.en : res?.message?.ar) ||
              res.error?.message ||
              res.error?.errorsConstraint[0] ||
              res.message
          );
        // throw new Error(err);
      }

      setIsEnquiryLoading && setIsEnquiryLoading(false);
    })
    .catch((err) => {
      console.log(err);
      console.log(err.message);
      if (err?.response?.status === 400 || err?.response?.status === 500) {
        setErrorAlert && setErrorAlert(true);
        setErrorMessage && setErrorMessage(err.response.data.message);
      }
      if (err.message) {
        // local code (js) errors
        // ex: not defined variable | cancelled request | ...
        setErrorMessage(err.message);
        // setErrorMessage(err.message.slice(12)); // do this only if error starts with => AxiosError
      }
      setIsEnquiryLoading && setIsEnquiryLoading(false);
    });
};

//* inject amount input into DOM => [Aman]
export const amanInputs = (
  type,
  billingAccountRef,
  billingAmountRef,
  setTopUpAmtount,
  topUpAmtount,
  setChargeAmtount,
  chargeAmtount,
  service,
  debounceFn
) => {
  let inputs = [];
  let myService = service?.id ? service : redux("currentService");

  //^ [top up] fees
  const topUpFees = 0.4286;

  //^ handle [top up] change
  // top up => balance
  const handleTopUpChange = (e) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    if (val) {
      setTopUpAmtount(val);
      let chargeAmtVal = parseFloat(
        (val * (1 + topUpFees)).toFixed(2)
      ).toString();
      if (myService.id === 59 || myService.id === 63) {
        // [59] => Orange Recharge // [63] => We Recharge
        billingAmountRef.current = Number(chargeAmtVal);
      } else {
        billingAmountRef.current = Number(val);
      }
      setChargeAmtount(chargeAmtVal);
    } else {
      // when value => "" => reset values
      billingAmountRef.current = null;
      setChargeAmtount("");
      setTopUpAmtount("");
    }
  };
  //^ handle [charge] change
  // charge amount => payment
  const handleChargeChange = (e) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    if (val) {
      setChargeAmtount(val);
      let topUpAmtVal = parseFloat(
        (val / (1 + topUpFees)).toFixed(2)
      ).toString();
      if (myService.id === 59 || myService.id === 63) {
        billingAmountRef.current = Number(val);
      } else {
        billingAmountRef.current = Number(topUpAmtVal);
      }
      setTopUpAmtount(topUpAmtVal);
    } else {
      // when value => "" => reset values
      billingAmountRef.current = null;
      setChargeAmtount("");
      setTopUpAmtount("");
    }
  };
  //^ ------------------------------------------- mandatory ----------------------------------------------
  //^ billing account input
  //Set placeholder for billing account input from extra data object if exist
  const billingAccountPlaceholder = myService?.extra_data.lang
    ? tools.locale === "en"
      ? myService?.extra_data.lang.en
      : myService?.extra_data.lang.ar
    : null;

  inputs.push(
    type === "currentService" ? (
      // or => (billingAccountRef) => need to be filled
      <input
        defaultValue={redux("paymentData").billingAccount}
        style={{ width: "40% !important", padding: "8px 6px" }}
        required
        type="number"
        name="billingAccount"
        placeholder={
          billingAccountPlaceholder || tools.t("customerId.billingAccount")
        }
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          billingAccountRef.current = e.target.value.trim();
        }}
      />
    ) : (
      // or => (!billingAccountRef)
      <div className="flex-line">
        <label className="flex-line-label">
          {tools.t("billDetails.number")}:
        </label>
        {/* service (not muService) => as this's shown only in quickPay service */}
        <div className="flex-line-body">{service?.billing_account}</div>
      </div>
    )
  );

  //^ ------------------------------------------- mandatory ----------------------------------------------
  //^ billing amount input
  switch (myService?.payment_type) {
    // TOPUP | NGO ===> value needed (Ex: phone balance recharge)

    case "TOPUP":
    case "NGO":
      if (myService?.extra_data?.package) {
        // 1111
        // if have fixed options to choose from
        inputs.push(
          <div className="d-flex justify-content-start w-100  mb-1">
            <label
              style={{
                display: (type = "currentService" ? "none" : ""),
                width: "120px",
              }}
              className="d-inline-block mt-1"
            >
              {type == "currentService" ? "" : tools.t("packageChoose")}
            </label>
            <select
              className="mt-3 w-75 m-auto d-block"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                billingAmountRef.current = Number(e.target.value);
                debounceFn && debounceFn(e);
              }}
            >
              <option value="" disabled selected>
                {tools.t("packageChoose")}
              </option>
              {myService?.extra_data?.packages?.map((packge, index) => (
                <option key={index} value={packge.value}>
                  {i18n.language === "ar" ? packge.name.ar : packge.name.en}
                </option>
              ))}
            </select>
          </div>
        );
      } else if (myService.biller_category_id === 3) {
        // if to enter the value manually
        // Telecom & Internet
        // 2222
        inputs.push(
          <div className="d-flex justify-content-start w-100  mb-1">
            <label
              style={{
                width: "120px",
              }}
              className="d-inline-block mt-1"
            >
              {type == "currentService" ? "" : tools.t("khales.amt")}
            </label>
            <div
              className="d-flex justify-content-start w-100  mb-1"
              style={{ width: "75%" }}
            >
              <input
                style={{ width: "40% !important", padding: "8px 6px" }}
                required
                type="text"
                value={topUpAmtount}
                name="billingAmount"
                placeholder={tools.t("khales.topUpAmt")}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  handleTopUpChange(e);
                  debounceFn && debounceFn(e);
                }}
              ></input>
              <div className="d-flex justify-content-center flex-column mx-3">
                <ArrowSwapHorizontal size="28" color="#FF8A65" />
              </div>
              <input
                style={{ width: "40% !important", padding: "8px 6px" }}
                required
                type="text"
                value={chargeAmtount}
                name="billingAmount"
                placeholder={tools.t("khales.chargeAmt")}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  handleChargeChange(e);
                  debounceFn && debounceFn(e);
                }}
              ></input>
            </div>
          </div>
        );
      } else {
        // if to enter the value manually
        // other than Telecom
        // 3333
        inputs.push(
          <div
            className={
              type == "currentService"
                ? ""
                : "d-flex justify-content-start w-100  mb-1"
            }
          >
            <label>
              {type === "multiPayService" ? tools.t("khales.amt") : ""}
            </label>

            <input
              required
              type="number"
              name="billingAmount"
              placeholder={tools.t("khales.amt")}
              onChange={(e) => {
                billingAmountRef.current = Number(e.target.value);
                debounceFn && debounceFn(e);
              }}
            ></input>
          </div>
        );
      }
    // default: // PAY ===> value not needed (phone bill)
    //   return null;
    // ===> inputs.push(null) => not needed
  }
  return inputs;
};

//* inject [khales] inputs into DOM
export const khalesInputs = (
  type,
  billingAccountRef,
  additionalDataRef,
  dateRef,
  service, // for multipay
  debounceFn // for multipay
) => {
  let inputs = [];
  let myService = service?.id ? service : redux("currentService");

  //^ ------------------------------------------- mandatory ----------------------------------------------
  //^ billing account input
  //Set placeholder for billing account input based on : [currentService.extra_data.billingAccount.en/ar]
  const billingAccountPlaceholder = myService.extra_data?.billingAccount
    ? i18n.language === "ar"
      ? myService.extra_data.billingAccount.ar
      : myService.extra_data.billingAccount.en
    : null;
  // -------

  inputs.push(
    type === "currentService" ? (
      // or => (billingAccountRef)
      <input
        type="text"
        name="billingAccount"
        // value={billingAccount}
        placeholder={
          billingAccountPlaceholder || tools.t("customerId.billingAccount")
        }
        onChange={(e) => {
          billingAccountRef.current = e.target.value;
          debounceFn && debounceFn(e);
        }}
      />
    ) : (
      // or => (!billingAccountRef)

      <div className="flex-line">
        <label className="flex-line-label">
          {tools.t("billDetails.number")}:
        </label>
        {/* service (not muService) => as this's shown only in quickPay service */}
        <div className="flex-line-body">{service.billing_account}</div>
      </div>
    )
  );

  //^ ------------------------------------------- optional ----------------------------------------------
  if (myService?.extra_data.packages) {
    if (!additionalDataRef.current.amount) {
      // if user entered some value, not to reset to "" on each rerender
      // i.e. => run on 1st render only (before user entered any data)
      additionalDataRef.current = {
        ...additionalDataRef.current,
        amount: "",
      };
    }
  }
  if (myService?.extra_data.postBillingAccount) {
    if (
      !additionalDataRef.current[myService?.extra_data.postBillingAccount.name]
    ) {
      // if user entered some value, not to reset to "" on each rerender
      // i.e. => run on 1st render only (before user entered any data)
      additionalDataRef.current = {
        ...additionalDataRef.current,
        [myService?.extra_data.postBillingAccount.name]: "",
      };
    }
  }
  if (myService?.extra_data.preBillingAccount) {
    if (
      !additionalDataRef.current[myService?.extra_data.preBillingAccount.name]
    ) {
      // if user entered some value, not to reset to "" on each rerender
      // i.e. => run on 1st render only (before user entered any data)
      additionalDataRef.current = {
        ...additionalDataRef.current,
        [myService?.extra_data.preBillingAccount.name]: "",
      };
    }
  }
  if (myService?.extra_data.additionalInfo) {
    myService?.extra_data.additionalInfo.map((info) => {
      if (!info.name) {
        // if user entered some value, not to reset to "" on each rerender
        // i.e. => run on 1st render only (before user entered any data)
        additionalDataRef.current = {
          ...additionalDataRef.current,
          [info.name]: "",
        };
      }
    });
  }
  if (myService?.extra_data.DateFrom) {
    if (!dateRef.current.dateFrom) {
      // if user entered some value, not to reset to "" on each rerender
      // i.e. => run on 1st render only (before user entered any data)
      dateRef.current = {
        ...dateRef.current,
        dateFrom: "", // will override "false" if this input is present => so empty key value checker will work properly
      };
    }
  }
  if (myService?.extra_data.DateTo) {
    if (!dateRef.current.dateTo) {
      // if user entered some value, not to reset to "" on each rerender
      // i.e. => run on 1st render only (before user entered any data)
      dateRef.current = {
        ...dateRef.current,
        dateTo: "", // will override "false" if this input is present => so empty key value checker will work properly
      };
    }
  }
  //^ ---------------------------------------------------------------------------------------------------
  //^ amount dropdown input
  //  main billing account: has a special key : could be phone number / national id / ...  ====>  saved in redux payment data billing account*/
  //  try later with amount, to gather them together, or let them all apart */
  myService?.extra_data.packages &&
    inputs.push(
      <div>
        <label>{type === "multiPayService" ? "Amount" : ""}</label>
        <select
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            additionalDataRef.current = {
              ...additionalDataRef.current,
              amount: Number(e.target.value), // will always be amount (always chosen by user)
            };
            debounceFn && debounceFn(e);
          }}
        >
          {myService?.extra_data?.packages?.map((packge, index) => (
            <option key={index} value={packge.value}>
              {i18n.language === "ar" ? packge.name.ar : packge.name.en}
            </option>
          ))}
        </select>
      </div>
    );
  //^ billing account input => [in case of POSTPAID service]
  myService?.extra_data.postBillingAccount &&
    inputs.push(
      <div>
        <label>
          {type === "multiPayService"
            ? `${
                myService?.extra_data.postBillingAccount.display[tools.locale]
              }:`
            : ""}
        </label>
        <input
          required
          type={
            myService?.extra_data.postBillingAccount.name === "count" ||
            myService?.extra_data.postBillingAccount.name === "amount"
              ? "number"
              : "text"
          }
          name={myService?.data.extra_data.postBillingAccount.name}
          placeholder={
            myService?.extra_data.postBillingAccount.display[tools.locale]
          }
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            additionalDataRef.current = {
              ...additionalDataRef.current,
              [myService?.extra_data.postBillingAccount.name]:
                myService?.extra_data.postBillingAccount.name === "count" ||
                myService?.extra_data.postBillingAccount.name === "amount"
                  ? Number(e.target.value)
                  : e.target.value,
            };
            debounceFn && debounceFn(e);
          }}
        ></input>
      </div>
    );
  //^ billing account input => [in case of PREPAID service]
  myService?.extra_data.preBillingAccount &&
    inputs.push(
      <div>
        <label>
          {type === "multiPayService"
            ? `${
                myService?.extra_data?.preBillingAccount?.display?.[
                  tools.locale
                ]
              }:`
            : ""}
        </label>
        <input
          required
          type={
            myService?.extra_data.preBillingAccount.name === "count" ||
            myService?.extra_data.preBillingAccount.name === "amount"
              ? "number"
              : "text"
          }
          name={myService?.extra_data.preBillingAccount.name}
          placeholder={
            i18n.language === "ar"
              ? myService?.extra_data.preBillingAccount.display.ar
              : myService?.extra_data.preBillingAccount.display.en
          }
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            additionalDataRef.current = {
              ...additionalDataRef.current,
              [myService?.extra_data.preBillingAccount.name]:
                myService?.extra_data.preBillingAccount.name === "count" ||
                myService?.extra_data.preBillingAccount.name === "amount"
                  ? Number(e.target.value)
                  : e.target.value,
            };
            debounceFn && debounceFn(e);
          }}
        ></input>
      </div>
    );
  //^ push any inputs in [additionalInfo]
  myService?.extra_data.additionalInfo &&
    myService?.extra_data.additionalInfo.map((info) => {
      inputs.push(
        <div>
          <label>
            {type === "multiPayService" ? info.display[tools.locale] : ""}
          </label>
          <input
            required
            type={
              info.name === "amount" || info.name === "count"
                ? "number"
                : "text"
            }
            name={info.name}
            placeholder={
              i18n.language === "ar" ? info.display.ar : info.display.en
            }
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              additionalDataRef.current = {
                ...additionalDataRef.current,
                [info.name]:
                  info.name === "amount" || info.name === "count"
                    ? Number(e.target.value)
                    : e.target.value,
              };
              debounceFn && debounceFn(e);
            }}
          ></input>
        </div>
      );
    });
  //^ date from input
  myService?.extra_data.DateFrom && (
    <div className="date-from">
      <label>{type === "multiPayService" ? tools.t("history.from") : ""}</label>
      <input
        onFocus={(e) => (e.target.type = "date")}
        onBlur={(e) => (e.target.type = "text")}
        placeholder={tools.t("history.from")}
        type="text"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          dateRef.current = {
            ...dateRef.current,
            dateFrom: e.target.value,
          };
          debounceFn && debounceFn(e);
        }}
      ></input>
    </div>
  );
  //^ date to input
  myService?.extra_data.DateTo && (
    <div className="date-to">
      <input
        onFocus={(e) => (e.target.type = "date")}
        onBlur={(e) => (e.target.type = "text")}
        placeholder={tools.t("history.to")}
        type="text"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          dateRef.current = {
            ...dateRef.current,
            dateTo: e.target.value,
          };
          debounceFn && debounceFn(e);
        }}
      ></input>
    </div>
  );

  return inputs;
};

//* handle aman submit
export const handleAmanSubmit = (
  e,
  billingAccountRef,
  billingAmountRef,
  aliasName,
  serviceName,
  isChecked,
  setAlertMessage,
  type,
  setIsEnquiryLoading
) => {
  e.preventDefault();
  //* 0) show alert if [billing account] is empty
  if (!billingAccountRef.current) {
    setAlertMessage(tools.t("history.requiredAccountInput"));
    return;
  }
  //* 1) show alert if [billing account] contain any not digit character (digit => 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
  if (/[^0-9]/g.test(billingAccountRef.current)) {
    setAlertMessage(t("billDetails.billingMustNumber"));
    // setIsEnquiryLoading(false); // for history type
    return;
  }

  //* 2) show alert if [billing amount] is less than 5
  if (amanInputs(billingAmountRef)[1] && Number(billingAmountRef.current) < 5) {
    setAlertMessage(tools.t("billDetails.lessThan5"));
    // setIsEnquiryLoading(false); // for history type
    return;
  }
  //* if type == "history"
  if (type == "history") {
    setIsEnquiryLoading(true);
  }

  //* 3) keep [billing account] + [billing amount] in redux
  store.dispatch(
    paymentDataActions.update({
      billingAccount: billingAccountRef.current,
      billingAmount: billingAmountRef.current || null, // in case of services with no needed value => backend needs it to be null
    })
  );
  //* if type == "history"
  if (type == "history") {
    runFetchEnquiry("aman", setAlertMessage)
      .then(() => {
        setIsEnquiryLoading(false);
      })
      .catch((err) => {
        setIsEnquiryLoading(false);
        setAlertMessage(err);
      });
  }
  //* if type != "history"
  if (type != "history") {
    //* navigate to (aman-enquiry) page
    tools.navigate("/aman-enquiry");

    // //* add or remove service from quick pay
    if (isChecked === isInQuickPay(redux("currentService").code)) {
      // no change or last change is the same as current state
      return;
    }
    if (isChecked !== isInQuickPay(redux("currentService").code)) {
      // if change happened
      if (isInQuickPay(redux("currentService").code) == true) {
        // if in quick pay => remove it
        removeQuickPayService(redux("currentService").code);
      } else {
        // if not in quick pay => add it
        // addQuickPayService(aliasName, serviceName);
        addQuickPayService(aliasName);
      }
    }
  }
};

//* handle khales submit
export const handleKhalesSubmit = async (
  e,
  billingAccountRef,
  additionalDataRef,
  dateRef,
  isChecked,
  setAlertMessage,
  aliasName,
  serviceName
) => {
  e.preventDefault();
  console.log(billingAccountRef.current);
  console.log(additionalDataRef.current);
  console.log(dateRef.current);
  //* 0) show alert if [billing account] is empty
  if (!billingAccountRef.current) {
    setAlertMessage(tools.t("history.requiredAccountInput"));
    return;
  }
  //* 1) show alert if [billing account] contain any not digit character (digit => 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
  if (/[^0-9]/g.test(billingAccountRef.current)) {
    setAlertMessage(t("billDetails.billingMustNumber"));
    return;
  }

  // //* 2) show alert if [billing amount] is less than 5 |||||||||||| or count
  if (
    additionalDataRef.current.amount &&
    Number(additionalDataRef.current.amount) < 5
  ) {
    setAlertMessage(tools.t("billDetails.lessThan5"));
    return;
  }
  //* 2) show alert if extraData (including billing amount) in not all filled
  if (isKhalesExtraInputsFilled(additionalDataRef, dateRef)) {
    setAlertMessage(tools.t("history.requiredInputs"));
    return;
  }
  //* 3) add prefix to name (en:"1-") (ar:"2-")
  const namePrefixHandler = () => {
    if (
      // [97-122] is the range of english characters unicode
      // check if the name is english or arabic name
      additionalDataRef.current.name[0].toLowerCase().charCodeAt(0) > 96 &&
      additionalDataRef.current.name[0].toLowerCase().charCodeAt(0) < 123
    ) {
      additionalDataRef.current = {
        ...additionalDataRef.current,
        name: `2- ${additionalDataRef.current.name}`,
      };
    } else {
      additionalDataRef.current = {
        ...additionalDataRef.current,
        name: `1- ${additionalDataRef.current.name}`,
      };
    }
  };
  additionalDataRef.current.name && namePrefixHandler();

  //* 4) keep [billing account] + [billing amount] in redux
  store.dispatch(
    paymentDataActions.update({
      billingAccount: billingAccountRef.current,
      // additionalData or additionalDataRef
      billingAmount:
        additionalDataRef.current.amount || additionalDataRef.current.count, // no used, but to follow same pattern
    })
  );

  //* 5) update current service with needed key to be used in fetchEnquiry directly
  // prefer to change in th future not here
  store.dispatch(
    currentServiceActions.update({
      // additionalData: extraData,
      // ...currentService, // not needed now
      // serviceCode: currentService.code,
      additionalData: additionalDataRef.current, // remove dateFrom + dateTo from it in case of error
      // billingAccount, // shifted back to paymentData
      // DateFrom:
      //   dateFrom === "false" ? dateFrom : new Date(dateFrom).toISOString(),
      // DateTo: dateTo === "false" ? dateTo : new Date(dateTo).toISOString(), // toISOString is shifted to (fetchEnquiry + transactionReceiptNumGenerator) in apiCalls
      DateFrom: dateRef.current.dateFrom,
      DateTo: dateRef.current.dateTo,
    })
  );

  //* 6) navigate to (khales-enquiry) page
  tools.navigate("/khales-enquiry");

  //* 7) add or remove service from quick pay
  if (isChecked === isInQuickPay(redux("currentService").code)) {
    // no change or last change is the same as current state
    return;
  }
  if (isChecked !== isInQuickPay(redux("currentService").code)) {
    // if change happened
    if (isInQuickPay(redux("currentService").code) == true) {
      // if in quick pay => remove it
      removeQuickPayService(redux("currentService").code);
    } else {
      // if not in quick pay => add it

      addQuickPayService(aliasName, serviceName);
    }
  }
};

//* prepaid quickPay service item [enquiry result]
export const enquiryCard = (service, prepaidEnquiryResult) => {
  return (
    <Box>
      <div className="flex-line">
        <label className="flex-line-label">
          {tools.t("billDetails.number")}:
        </label>
        <div className="flex-line-body">{service?.billing_account}</div>
      </div>
      <Box
        style={{ marginTop: "0px !important" }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Box
          sx={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#141414",
            mt: 0,
          }}
        >
          <MoneySend size="20" />
          <span className="d-inline-block mx-2">
            {tools.t("billDetails.total")}
          </span>
        </Box>
        <Box
          sx={{
            fontWeight: "600",
            color: "#5A5A5A",
            fontSize: "14px",
          }}
        >
          {prepaidEnquiryResult.totalAmount ||
            prepaidEnquiryResult.overallPayment}
          {tools.t("billDetails.egp")}
        </Box>
      </Box>
    </Box>
  );
};

//* check if all khales form input are filled
export const isKhalesExtraInputsFilled = (additionalDataRef, dateRef) => {
  const isAdditionalDataEntered = Object.keys(additionalDataRef.current).every(
    (key) => !!additionalDataRef.current[key]
  );

  const isDateEntered = Object.keys(dateRef.current).every(
    (key) => !!dateRef.current[key]
  );
  const isDateFalse = Object.keys(dateRef.current).every((key) =>
    dateRef.current[key] === "false" ? true : false
  );
  if (!isAdditionalDataEntered) {
    return true;
  }
  if (!isDateFalse && !isDateEntered) {
    return true;
  }
  return false;
};
