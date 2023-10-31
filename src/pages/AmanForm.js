import { useState, useEffect, useRef } from "react";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { paymentDataActions } from "../Redux/store";
import BillerName from "../components/BillerName";
import "../style/pages/service.css";
import AlertMessage from "../components/AlertMessage";
import QuickPayAddRemoveToggle from "../components/QuickPayAddRemoveToggle";
import {
  isInQuickPay,
  amanInputs,
  handleAmanSubmit,
} from "../utilities/serviceFunctions";
export default function Service() {
  //* localization ******************************************
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* redux *************************************************
  const currentService = useSelector((state) => state.currentService.value);
  const paymentData = useSelector((state) => state.paymentData.value);
  const dispatch = useDispatch();
  //* constants *********************************************
  const serviceName =
    locale === "en"
      ? currentService.serviceName.en
      : currentService.serviceName.ar;
  //* refs & states *****************************************
  const billingAccountRef = useRef("");
  const billingAmountRef = useRef("");
  const [topUpAmtount, setTopUpAmtount] = useState(""); // balance (top up) amount => 7    [use to fetch enquiry for all services]
  const [chargeAmtount, setChargeAmtount] = useState(""); // payment (charge) amount => 10 [use to fetch enquiry only for (id === 59 + 63)]
  const [isChecked, setIsChecked] = useState(isInQuickPay(currentService.code));
  const [aliasName, setAliasName] = useState("");
  const [alertMessage, setAlertMessage] = useState();
  //* effects ***********************************************
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(
      paymentDataActions.update({
        enquiryResult: null,
      })
    );
  }, []);
  //* return ***********************************************
  return (
    <div className="service">
      {alertMessage && (
        <AlertMessage
          setAlertMessage={setAlertMessage}
          // title={alertTitle}
          message={alertMessage}
        />
      )}
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
            <p>{serviceName}</p>
          </div>
        </div>
        <form
          className="serviceInputs"
          onSubmit={(e) =>
            handleAmanSubmit(
              e,
              billingAccountRef,
              billingAmountRef,
              aliasName,
              undefined, // serviceName
              isChecked,
              setAlertMessage
            )
          }
        >
          {amanInputs(
            "currentService",
            billingAccountRef,
            billingAmountRef,
            setTopUpAmtount,
            topUpAmtount,
            setChargeAmtount,
            chargeAmtount
          )}
          <QuickPayAddRemoveToggle
            type="checkbox"
            isChecked={isChecked}
            setIsChecked={setIsChecked}
          ></QuickPayAddRemoveToggle>
          {isChecked && !isInQuickPay(currentService.code) && (
            <input
              placeholder={t("quickPay.aliasNameText")}
              type="text"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
            />
          )}
          <button className="text-white">{t("customerId.confirm")}</button>
        </form>
      </div>
    </div>
  );
}
