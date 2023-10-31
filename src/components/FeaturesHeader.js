import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageAdd1, Cards } from "iconsax-react";
import { useSelector, useDispatch } from "react-redux";
import i18n from "../locals/i18n";

import "./FeaturesHeader.css";

export default function FeaturesHeader(props) {
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

  return (
    <div dir={t("layout.dir")} className="feature-header">
      <div className="d-flex align-center justify-content-between">
        <span className="d-flex align-center gap-1 mt-2">
          <props.icon size="22" color="#2D317F" />
          <h6>{props.title}</h6>
        </span>
        <div>
          {props.add ? (
            <MessageAdd1 size="22" color="#2D317F" variant="Bold" />
          ) : (
            <div
              className="d-flex align-center justify-content-between"
              style={{ color: "#2D317F" }}
            >
              {/* {props.type === "quickpay" &&
                clientData?.phone_number.includes("01126728146") && (
                  <div
                    className="mx-3 p-2 rounded"
                    style={{
                      cursor: "pointer",
                      background: props.multipay ? "#2D317F" : "white",
                    }}
                    onClick={() => {
                      if (!props.multipay) {
                        dispatch(resetAllMultiPayServices());
                      }
                      props.setMultipay(!props.multipay);
                    }}
                  >
                    <span
                      className="mx-1 d-inline-block font-weight-bold"
                      style={{ color: props.multipay ? "white" : "#2D317F" }}
                    >
                      {t("quickPay.multipay")}
                    </span>
                    <Cards
                      size="22"
                      color={props.multipay ? "white" : "#2D317F"}
                    />
                  </div>
                )} */}
              <div
                className="bg-white p-2 rounded"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(props.url);
                }}
              >
                <span className="mx-1 d-inline-block font-weight-bold">
                  {t("quickPay.add")}
                </span>
                <MessageAdd1
                  // onClick={() => {
                  //   navigate(props.url);
                  // }}
                  size="22"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
