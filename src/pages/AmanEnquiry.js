import { useState, useEffect, useLayoutEffect } from "react";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BillerName from "../components/BillerName";
import {
  fetchEnquiry,
  transactionReceiptNumGenerator,
  requestUrlToken, // cowpay
  requestUrl, // paymob
} from "../utilities/apiCalls";
import Loader from "../components/Loader";
import {
  cowPay, // cowpay
  openPaymobIframe, // paymob
  removeCowPay,
} from "../utilities/paymentFunctions";
import "../style/pages/aman.css";
import "../style/pages/service.css";
import { runFetchEnquiry } from "../utilities/serviceFunctions";
import { paymentDataActions } from "../Redux/store";
export default function Aman() {
  //* routing
  const navigate = useNavigate();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";

  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const currentService = useSelector((state) => state.currentService.value);
  const paymentData = useSelector((state) => state.paymentData.value);
  let enquiryResult = paymentData.enquiryResult;

  const dispatch = useDispatch();

  //* states
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setLoading] = useState(false);

  function handleError() {
    navigate(-1);
  }
  // function confirmPayment() {
  //   setLoading(true);
  //   // 1) generate transaction number
  //   transactionReceiptNumGenerator("aman").then((res1) => {
  //     // 2) request url token using the generated transaction number
  //     requestUrlToken(Number(res1.data.transactionReceiptNum)).then((res2) => {
  //       // 3) open cow pay portal using the generated token
  //       cowPay(res2.token);
  //     });
  //   });
  // }
  function confirmPayment() {
    setLoading(true);
    // 1) generate transaction number
    transactionReceiptNumGenerator("aman").then((res1) => {
      // 2) request url token using the generated transaction number
      requestUrl(Number(res1.data.transactionReceiptNum)).then((res2) => {
        // 3) open cow pay portal using the generated url
        openPaymobIframe(res2.url);
      });
    });
  }

  //! effects *******************************************
  useEffect(() => {
    //* scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    //* api calls

    if (!enquiryResult?.uuid) {
      runFetchEnquiry("aman", setErrorMessage);
    }

    //*
  }, []);
  useLayoutEffect(() => {
    // to remove cow pay popup on back click
    removeCowPay();
  }, []);
  useEffect(() => {
    // reset payment data before entering cowPayPayment page
    dispatch(
      paymentDataActions.update({
        cowPayData: null,
      })
    );
  }, []);
  return (
    <div className="aman" dir={t("layout.dir")}>
      <div className="container">
        <BillerName />
        <div className="service-name">
          <div className="image">
            <img
              loading="lazy"
              src={currentService.image}
              alt={currentService.serviceName.en}
            />
          </div>
          <div>
            <p>{t("billDetails.review")}</p>
          </div>
        </div>

        {enquiryResult ? (
          <>
            <div className="enquiry-result">
              <div className="billDetails d-flex justify-content-center">
                <div className="details">
                  <div className="biller-account s-line">
                    <p>{t("billDetails.custCode")}</p>
                    <p>{enquiryResult.billingAccount}</p>
                  </div>
                  {enquiryResult.paymentParameters?.["ar#customerName"] && (
                    <div className="customer-Name s-line">
                      <p>{t("billDetails.custName")}</p>
                      <p>
                        {enquiryResult.paymentParameters["ar#customerName"]}
                      </p>
                    </div>
                  )}
                  <div className="amount">
                    <span>{t("billDetails.dueAmount")}</span>
                    <span>
                      {(+enquiryResult.amount).toFixed(2) +
                        t("billDetails.egp")}
                    </span>
                  </div>
                  <div className="fees">
                    <span>{t("billDetails.serviceFees")}</span>
                    <span>
                      {(+enquiryResult.totalFees).toFixed(2) +
                        t("billDetails.egp")}
                    </span>
                  </div>
                  <div className="total">
                    <span id="total-amount">{t("billDetails.total")}</span>
                    <span>
                      {(+enquiryResult.totalAmount).toFixed(2) +
                        t("billDetails.egp")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="mt-3 confirm-pay text-white"
              onClick={() => (!isLoading ? confirmPayment() : null)}
              disabled={isLoading}
            >
              {isLoading ? t("billDetails.wait") : t("billDetails.confirm")}
            </button>
          </>
        ) : errorMessage ? (
          <div className="error-message">
            <div className="mb-3">
              <p>
                {i18n.language === "en"
                  ? errorMessage?.en || errorMessage
                  : errorMessage?.ar || errorMessage}
              </p>
            </div>
            <button className="text-white" onClick={handleError}>
              {t("billDetails.badRequesrError")}
            </button>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}
