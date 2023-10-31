import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AlertMessage from "../components/AlertMessage";
import i18n from "../locals/i18n";
import BillerName from "../components/BillerName";
import QuickPayAddRemoveToggle from "../components/QuickPayAddRemoveToggle";
import { useSelector, useDispatch } from "react-redux";
import { paymentDataActions } from "../Redux/store";
import "../style/pages/service.css";
import {
  isInQuickPay,
  khalesInputs,
  handleKhalesSubmit,
} from "../utilities/serviceFunctions";
export default function Service() {
  //* localization ******************************************
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* redux *************************************************
  const currentService = useSelector((state) => state.currentService.value); // currentService.extraData
  const paymentData = useSelector((state) => state.paymentData.value);
  const dispatch = useDispatch();
  //* refs & states *****************************************
  // main input (billing account: can be phone number or national id or anything based on : [currentService.extra_data.billingAccount.en/ar] )
  const billingAccountRef = useRef("");
  // additional input (including billing amount if present)
  // not gonna work inside functions, so we will replace it with ref, and we're gonna make the same for billing account to be the same pattern only
  const additionalDataRef = useRef({});
  const dateRef = useRef({ dateFrom: "false", dateTo: "false" });
  const [isChecked, setIsChecked] = useState(isInQuickPay(currentService.code));
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState();
  const [aliasName, setAliasName] = useState("");
  //* constants *********************************************
  const serviceName =
    locale === "en"
      ? currentService.serviceName.en
      : currentService.serviceName.ar;
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
    <div className="service" dir={t("layout.dir")}>
      {alertMessage && (
        <AlertMessage
          title={alertTitle}
          message={alertMessage}
          setAlertMessage={setAlertMessage}
        />
      )}
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
            <p>
              {i18n.language === "en"
                ? currentService.serviceName.en
                : currentService.serviceName.ar}
            </p>
          </div>
        </div>
        <form
          className="serviceInputs"
          onSubmit={(e) =>
            handleKhalesSubmit(
              e,
              billingAccountRef,
              additionalDataRef,
              dateRef,
              isChecked,
              setAlertMessage,
              aliasName,
              serviceName
            )
          }
        >
          {khalesInputs(
            "currentService",
            billingAccountRef,
            additionalDataRef,
            dateRef
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
              onChange={(e) => {
                setAliasName(e.target.value);
              }}
            />
          )}
          <button className="text-white w-75 m-auto">
            {t("customerId.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
}
