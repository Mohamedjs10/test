import { useState, useEffect, useLayoutEffect } from "react";
import i18n from "../locals/i18n";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";

import Card from "../components/Card";
import BillerName from "../components/BillerName";
import {
  userInfoActions,
  allCategoriesBillersServicesActions,
  currentServiceActions,
  paymentDataActions,
} from "../Redux/store";
import "../style/pages/services.css";

export default function Biller(type, item) {
  //* redux
  const currentBillerServices = useSelector(
    (state) => state.currentBiller.value.biller_services
  );
  const paymentData = useSelector((state) => state.paymentData.value);
  const dispatch = useDispatch();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";

  //* effects
  useEffect(() => {
    // reset payment data before service form, as each service form has different payment data
    dispatch(
      paymentDataActions.update({
        billingAccount: null,
        billingAmount: null,
      })
    );
    // reset currentService
    dispatch(currentServiceActions.update(null));
  }, []);
  return (
    <div dir={t("layout.dir")} className="biller">
      <div className="container">
        <BillerName />
        <div className="services">
          {currentBillerServices.map((service) => (
            <Card type="service" item={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
