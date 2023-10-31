import { useState, useEffect, useLayoutEffect } from "react";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BillerName from "../components/BillerName";
import {
  fetchEnquiry,
  transactionReceiptNumGenerator,
  requestUrlToken,
} from "../utilities/apiCalls";
import Loader from "../components/Loader";
import { cowPay, removeCowPay } from "../utilities/paymentFunctions";
import "../style/pages/aman.css";
import "../style/pages/service.css";
import { runFetchEnquiry } from "../utilities/serviceFunctions";
import { paymentDataActions } from "../Redux/store";

export default function Khales() {
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
  const [successResult, setSuccessResult] = useState(false);
  const [enquiryRes, setEnquiryResult] = useState();
  // const [errorAlert, SetErrorAlert] = useState(false);
  const [successPayment, setSuccessPayment] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [customerName, setCustomerName] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setLoading] = useState(false);

  function handleError() {
    navigate(-1);
  }
  function confirmPayment() {
    setLoading(true);
    // 1) generate transaction number
    transactionReceiptNumGenerator("khales_payment").then((res1) => {
      // 2) request url token using the generated transaction number
      requestUrlToken(Number(res1.data.transactionReceiptNum)).then((res2) => {
        // 3) open cow pay portal using the generated token
        cowPay(res2.token);
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

    const serviceType =
      currentService.payment_type === "PREPAID"
        ? "khales_prepaid"
        : "khales_postpaid";
    runFetchEnquiry(serviceType, setErrorMessage);

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
              src={currentService.image}
              alt={currentService.serviceName.en}
            />
          </div>
          <div>
            <p>
              {i18n.language === "en"
                ? currentService.serviceName?.en
                : currentService.serviceName?.ar}
            </p>
          </div>
        </div>
        {errorMessage && (
          <div>
            <div className="mb-3 text-center">{errorMessage}</div>
            <button
              className="m-auto d-block w-75 text-white"
              onClick={handleError}
            >
              {t("billDetails.badRequesrError")}
            </button>
          </div>
        )}
        {enquiryResult?.uuid && (
          <>
            <div className="enquiry-result">
              <div className="billDetails d-flex justify-content-center">
                <div className="details">
                  <div className="biller-account s-line">
                    <p>{t("billDetails.custCode")}</p>
                    <p>
                      {currentService.code == "55570"
                        ? currentService.account
                        : enquiryResult.customerData?.customerCode}
                    </p>
                  </div>
                  {customerName && (
                    <div className="customer-Name s-line">
                      <p>{t("billDetails.custName")}</p>
                      <p>{enquiryResult.customerData["customerName"]}</p>
                    </div>
                  )}

                  <div className="biller-account s-line">
                    <p>{t("billDetails.moreDetails")}</p>
                    <p className={t("layout.textAlign")}>
                      {enquiryResult.billerDetails}
                    </p>
                  </div>

                  <div className="amount">
                    <span>{t("billDetails.dueAmount")}</span>
                    <span>{enquiryResult.amount + t("billDetails.egp")}</span>
                  </div>
                  <div className="fees">
                    <span>{t("billDetails.serviceFees")}</span>
                    {/* totalFees = feesAmount(khales) + vat(cowpay) */}
                    <span>
                      {enquiryResult.totalFees + t("billDetails.egp")}
                    </span>
                  </div>
                  <div className="total">
                    <span id="total-amount">{t("billDetails.total")}</span>
                    <span>
                      {enquiryResult.overallPayment + t("billDetails.egp")}
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

            {/* <>----------------------------------------------------------------------------------------------</> */}
          </>
        )}
        {!enquiryResult?.uuid && !errorMessage && <Loader />}

        {successPayment && (
          <div className="payment-result">
            {t("billDetails.successfulTransaction")}
          </div>
        )}
      </div>
    </div>
  );
}
