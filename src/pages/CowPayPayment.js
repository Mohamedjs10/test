import { useState, useEffect, useLayoutEffect } from "react";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEnquiry,
  transactionReceiptNumGenerator,
  requestUrlToken,
} from "../utilities/apiCalls";
import Loader from "../components/Loader";
import ShareButton from "../components/ShareButton";
import QuickPayAddRemoveToggle from "../components/QuickPayAddRemoveToggle";
import BillerName from "../components/BillerName";
import { isInQuickPay } from "../utilities/serviceFunctions";
import { cowPayListener, handleBack } from "../utilities/paymentFunctions";
import {
  userInfoActions,
  allCategoriesBillersServicesActions,
  paymentDataActions,
} from "../Redux/store";
import "../style/pages/cowPayPayment.css";
import "../style/pages/aman.css";
export default function CowPayPayment(props) {
  //* routing
  const navigate = useNavigate();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";

  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const currentService = useSelector((state) => state.currentService.value);
  const paymentData = useSelector((state) => state.paymentData.value);
  let cowPayData = paymentData.cowPayData;
  const dispatch = useDispatch();
  //* states
  const [open, setOpen] = useState(false);

  useEffect(() => {
    cowPayListener();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="cowPayPage" dir={t("layout.dir")}>
      {/* false at first, so cowpay appear on blank bg at first (after navigation)  */}

      {cowPayData && (
        <div className="container">
          <div className="service-name">
            <div className="image">
              <img
                loading="lazy"
                src={currentService?.image}
                alt={currentService?.serviceName?.en}
              />
            </div>
            <div>
              <p>{t("billDetails.billDetails")}</p>
            </div>
          </div>
          <div className="payment-result enquiry-result">
            {cowPayData.payment_status === "PAID" && (
              <div className="details">
                <div className="biller-account s-line">
                  <p>{t("billDetails.custCode")}</p>
                  <p>{currentService?.billingAccount}</p>
                </div>
                <div className="status">
                  <span>{t("history.orderStatus")}</span>
                  <span>{cowPayData.payment_status}</span>
                </div>
                <div className="refNumber">
                  <span>{t("history.refNumber")}</span>
                  <span>{cowPayData.cowpay_reference_id}</span>
                </div>
                <div className="total">
                  <span id="total-amount">{t("billDetails.total")}</span>
                  <span>{cowPayData.amount + t("billDetails.egp")}</span>
                </div>
                <p className="mt-2">{t("billDetails.successMsg")}</p>
              </div>
            )}
            {cowPayData.payment_status === "FAILED" && (
              <div className="faild">
                <p>{t("billDetails.errorMsg")}</p>
              </div>
            )}
          </div>
          <div className="bill-buttons mt-4">
            <ShareButton />
            <button className="text-white" onClick={() => handleBack(setOpen)}>
              {t("billDetails.badRequesrError")}
            </button>
          </div>
        </div>
      )}

      <QuickPayAddRemoveToggle
        type="service"
        serviceCode={currentService?.code}
        setOpen={setOpen}
        open={open}
      ></QuickPayAddRemoveToggle>
    </div>
  );
}
