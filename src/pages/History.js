import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { paymentDataActions } from "../Redux/store";
import { useNavigate } from "react-router-dom";

import React, { useState, Fragment, useLayoutEffect } from "react";
import { RefreshLeftSquare } from "iconsax-react";
import FeaturesHeader from "../components/FeaturesHeader";
import NoRecords from "../components/NoRecords";
import Loader from "../components/Loader";
import "../style/history.css";
import { getUserHistory } from "../utilities/apiCalls";
import Slide from "@mui/material/Slide";
import HistoryCard from "../components/HistoryCard";
import { historyOrdersActions } from "../Redux/store";
import AlertMessage from "../components/AlertMessage";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function History() {
  //* routing
  const navigate = useNavigate();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const currentService = useSelector((state) => state.currentService.value);
  const historyOrders = useSelector((state) => state.historyOrders.value);
  let successfulHistoryOrders = historyOrders?.filter(
    // successfulHistoryOrder => [status === "PAID"] => [transactions.length > 0] => each order must have at least one transaction
    (order) => order.status === "PAID"
  );
  const dispatch = useDispatch();
  //* states

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState();

  const clientId = userInfo.id;

  const handleShowAlert = (show) => {
    setShowAlert(false);
  };

  //* effects

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // rest enquiry result for next page (AmanReorderFormAndEnquiry)
    dispatch(
      paymentDataActions.update({
        enquiryResult: null,
      })
    );
  }, []);
  //*

  return (
    <div className="client-history" dir={t("layout.dir")}>
      <div className="container">
        <FeaturesHeader
          title={t("quickPay.history")}
          icon={RefreshLeftSquare}
        />

        {successfulHistoryOrders?.length > 0 ? (
          <div className="orders">
            {successfulHistoryOrders?.map((order) => {
              return order?.transactions.map((transaction, i) => (
                <HistoryCard order={order} transaction={transaction} key={i} />
              ));
            })}
          </div>
        ) : successfulHistoryOrders?.length == 0 ? (
          <NoRecords
            title={t("quickPay.noHistory.title")}
            text={t("quickPay.noHistory.text")}
          />
        ) : (
          <Loader />
        )}
      </div>
      {/* alert */}
      {showAlert && (
        <AlertMessage
          show={handleShowAlert}
          title={alertTitle}
          message={alertMessage}
        />
      )}
    </div>
  );
}
