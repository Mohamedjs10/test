import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "../style/service.css";
import { updateMultiPayServiceNameKey } from "../Redux/multipaySlice";
import { useDispatch } from "react-redux";

import MultiPayItem from "../components/multiPayItem";
import quickpayImg from "../images/money-send.svg";
export default function MultiPay() {
  const { services } = useSelector((state) => state.multiPayServices);

  const { t } = useTranslation();
  let navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    services?.map((item, index) => {
      if (item?.service_data && "name" in item?.service_data) {
        dispatch(updateMultiPayServiceNameKey(index));
      }
    });

    navigate("/payment-services/multipay");
  };

  return (
    <div className="service" dir={t("layout.dir")}>
      <div className="container">
        <div className="service-name">
          <div className="image">
            <img loading="lazy" src={quickpayImg} alt="multi-pay" />
          </div>
          <div>
            <p>{t("quickPay.quickPay")}</p>
          </div>
        </div>
        <form className="d-block" onSubmit={handleSubmit}>
          {services.length
            ? services?.map((service, index) => (
                <MultiPayItem
                  service={service}
                  key={index}
                  services={services}
                />
              ))
            : null}
          <button
            className="d-block my-3 text-white"
            style={{
              width: "100%",
              background: "#ff8e0a",
            }}
          >
            {t("quickPay.payNow")}
          </button>
        </form>
      </div>
    </div>
  );
}
