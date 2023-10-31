import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import i18n from "../locals/i18n";
import BillerName from "../components/BillerName";
import Loader from "../components/Loader";
import noBillImage from "../images/no-bill.svg";
import {
  transactionReceiptNumGenerator,
  requestUrlToken,
} from "../utilities/apiCalls";
import AlertMessage from "../components/AlertMessage";
import "../style/history-details.css";
import "../style/pages/service.css";
import { runFetchEnquiry } from "../utilities/serviceFunctions";
import { cowPay, removeCowPay } from "../utilities/paymentFunctions";
import { HandleTransactionDate } from "../utilities/historyFunction";
import { paymentDataActions } from "../Redux/store";
import {
  isInQuickPay,
  khalesInputs,
  handleKhalesSubmit,
  isKhalesExtraInputsFilled,
} from "../utilities/serviceFunctions";
import { isDisabled } from "@testing-library/user-event/dist/utils";
const KhalesReorderFormAndEnquiry = () => {
  //* redux
  const currentService = useSelector((state) => state.currentService.value);
  const paymentData = useSelector((state) => state.paymentData.value);
  let enquiryResult = paymentData.enquiryResult;
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* constants *********************************************
  const serviceName =
    locale === "en"
      ? currentService.serviceName.en
      : currentService.serviceName.ar;

  const dispatch = useDispatch();
  //******************* generate initial values ***********************
  const initialBillingAccount = paymentData.billingAccount;
  const initialChargeAmount = paymentData.billingAmount;
  const initialTopupAmount = Math.round(
    paymentData.billingAmount / (1 + 0.4286), // 0.4286 => topUpFees
    2
  ).toString();
  // [59] => Orange Recharge // [63] => We Recharge
  const initialBillingAmount =
    currentService.id === 59 || currentService.id === 63
      ? initialChargeAmount
      : initialTopupAmount;

  //* refs & states *****************************************
  const billingAccountRef = useRef(initialBillingAccount);
  const additionalDataRef = useRef({});
  const dateRef = useRef({ dateFrom: "false", dateTo: "false" });
  // ------
  const [alertMessage, setAlertMessage] = useState("");
  const [errorAlert, setErrorAlert] = useState(false);
  const [isEnquiryLoading, setIsEnquiryLoading] = useState(false);
  const [isCowPayLoading, setIsCowPAyLoading] = useState(false);

  //* effects *******************************************
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (currentService?.payment_type === "POSTPAID") {
      // if no-amount-needed service ("PAY": aman) ("POSTPAID": khales)
      setIsEnquiryLoading(true);
      runFetchEnquiry(
        "khales_postpaid",
        setAlertMessage,
        // setErrorAlert,
        undefined,
        setIsEnquiryLoading
      );
    }
    // to remove cow pay popup on back click
    removeCowPay();
    // reset cow pay data
    dispatch(
      paymentDataActions.update({
        cowPayData: null,
      })
    );
  }, []);

  //! ***********************************************************************************************************

  function confirmPayment() {
    setIsCowPAyLoading(true);
    // 1) generate transaction number
    transactionReceiptNumGenerator("aman").then((res1) => {
      // 2) request url token using the generated transaction number
      requestUrlToken(Number(res1.data.transactionReceiptNum)).then((res2) => {
        // 3) open cow pay portal using the generated token
        cowPay(res2.token);
      });
    });
  }

  return (
    <div className="aman-history" dir={t("layout.dir")}>
      {alertMessage && (
        <AlertMessage
          // title={alertTitle}
          message={alertMessage}
          setAlertMessage={setAlertMessage}
        />
      )}
      <div className="container">
        <BillerName />
      </div>
      <div className="container">
        <div className="review-heading-box p-3 d-flex flex-column">
          <img
            src={currentService?.image}
            alt=""
            width="40px"
            className="d-block m-auto"
          />
          <h6 className="m-auto mt-2 ">{t("billDetails.review")}</h6>
        </div>
      </div>
      <div className="container">
        <div className="history-deatils p-3 my-5">
          <div className="d-flex justify-content-between">
            <h5>
              {i18n.language === "en"
                ? currentService?.billerCatName?.en
                : currentService?.billerCatName?.ar}
            </h5>
            <p>{HandleTransactionDate(currentService?.updated_at)}</p>
          </div>
          <div className="d-flex justify-content-start mb-4">
            <img
              src={currentService?.image}
              width="20px"
              className="d-inline-block"
              alt={currentService?.serviceName?.en}
            />
            <span className="d-inline-block mx-2">
              {i18n.language === "en"
                ? currentService?.serviceName?.en
                : currentService?.serviceName?.ar}
            </span>
          </div>
          <div className="bill-details d-flex flex-column">
            <div className="d-flex justify-content-between">
              <h6 className="text">
                {currentService?.extra_data
                  ? i18n.language === "en"
                    ? currentService?.extra_data?.lang?.en
                    : currentService?.extra_data?.lang?.ar
                  : t("customerId.billingAccount")}
              </h6>
              <h6 className="data">{paymentData.billingAccount}</h6>
            </div>
            <div className="d-flex justify-content-between">
              <h6 className="text">{t("billDetails.billNo")}</h6>
              <h6 className="data">{currentService?.receipt_num}</h6>
            </div>
            <div className="d-flex justify-content-between">
              <h6 className="text">{t("internalCashIn.totalAmount")}</h6>
              <h6 className="data">
                {paymentData.billingTotalAmount} {t("billDetails.egp")}
              </h6>
            </div>
            <div className="d-flex justify-content-between">
              <h6 className="text">{t("history.orderStatus")}</h6>
              <h6 className={`data status ${currentService?.status}`}>
                {currentService.status}
              </h6>
            </div>
          </div>
        </div>
      </div>
      <hr></hr>
      <div className="container">
        <h5 className="mt-4">{t("billDetails.newBill")}</h5>
      </div>

      {/* enquiryResult => "POSTPAID" type => */}
      {enquiryResult ? (
        <div className="container">
          <div className="new-bill p-3 my-3">
            <h6 className="text">{t("billDetails.customerCode")}</h6>
            <h6 className="data">{enquiryResult?.billingAccount}</h6>
            <div className="mt-3 new-bill-data">
              <div className="d-flex justify-content-between">
                <h6 className="text">{t("billDetails.dueAmount")}</h6>
                <h6 className="data">
                  {enquiryResult?.amount}
                  {t("billDetails.egp")}
                </h6>
              </div>
              <div className="d-flex justify-content-between">
                <h6 className="text">{t("billDetails.serviceFees")}</h6>
                <h6 className="data">
                  {(+enquiryResult?.totalFees).toFixed(2)}
                  {t("billDetails.egp")}
                </h6>
              </div>
              <div className="d-flex justify-content-between">
                <h6 className="text">{t("billDetails.total")}</h6>
                <h6 className="data">
                  {enquiryResult?.totalAmount}
                  {t("billDetails.egp")}
                </h6>
              </div>
            </div>
          </div>
          <button
            className="mt-3 confirm-pay text-white m-auto d-block"
            onClick={() => (!isCowPayLoading ? confirmPayment() : null)}
            disabled={isCowPayLoading}
          >
            {isCowPayLoading ? t("billDetails.wait") : t("billDetails.rePay")}
          </button>
        </div>
      ) : errorAlert ? (
        <div className="container">
          <div className="error-bill mt-3 py-5">
            <div className="image box m-auto">
              <img
                src={noBillImage}
                className="m-auto d-block"
                alt="no bill yet"
              />
            </div>
            <h6 className="mt-3 text-center">{t("billDetails.noBill")}</h6>
          </div>
        </div>
      ) : !isEnquiryLoading ? (
        <div className="container mt-5">
          {khalesInputs(
            "currentService",
            billingAccountRef,
            additionalDataRef,
            dateRef
          )}
          <button
            onClick={(e) => {
              handleKhalesSubmit(
                e,
                billingAccountRef,
                additionalDataRef,
                dateRef,
                undefined,
                setAlertMessage,
                undefined,
                serviceName
              );
            }}
            className="w-75 d-block mt-3 m-auto text-white"
          >
            {t("customerId.confirm")}
          </button>
        </div>
      ) : (
        <Loader type="new-bill" />
      )}
    </div>
  );
};

export default KhalesReorderFormAndEnquiry;
