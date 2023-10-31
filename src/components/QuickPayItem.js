import { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";
import { MoneySend } from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Loader";
import { deleteFromQuickPay } from "../utilities/apiCalls";
import { quickPayActions } from "../Redux/store";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  amanInputs,
  khalesInputs,
  runFetchEnquiry,
  isKhalesExtraInputsFilled,
  enquiryCard,
} from "../utilities/serviceFunctions";
export default function QuickPayItem({ type, service, index }) {
  //* localization
  const { t } = useTranslation();
  //* redux
  const quickPay = useSelector((state) => state.quickPay.value);
  const dispatch = useDispatch();
  //* refs & states **************** Aman *************************
  // const billingAccountRef = useRef("");
  const billingAmountRef = useRef("");
  const [topUpAmtount, setTopUpAmtount] = useState(""); // balance (top up) amount => 7    [use to fetch enquiry for all services]
  const [chargeAmtount, setChargeAmtount] = useState("");
  //* refs & states **************** Khaled *************************
  // const billingAccountRef = useRef("");
  const additionalDataRef = useRef({});
  // const dateRef = useRef({ dateFrom: "false", dateTo: "false" });
  const dateRef = useRef({ dateFrom: "false", dateTo: "false" }); // set on initialization inside [khalesInputs]

  //* states
  const [isChecked, setIsChecked] = useState(true); // important for postpaid, as prepaid is set to true in then anyways
  const [isEnquiryLoading, setIsEnquiryLoading] = useState(false);
  // setPrepaidEnquiryResult only if successful (then)
  const [prepaidEnquiryResult, setPrepaidEnquiryResult] = useState(null);
  // set error message if prepaid enquiry failed (catch)
  const [errorMsg, setErrorMsg] = useState("");

  const debounceFn = useCallback(
    debounce((e) => {
      const fetchEnquiryServiceType =
        service.provider_name === "aman"
          ? "aman"
          : service.payment_type === "PREPAID"
          ? "khales_prepaid"
          : "khales_postpaid";

      if (fetchEnquiryServiceType == "khales_prepaid" || "khales_postpaid") {
        // should be khales_prepaid only?? no as even if in khales_postpaid we need account in normal flow (not in quickpay or history)
        // no need in aman => as aman have only amount input
        if (isKhalesExtraInputsFilled(additionalDataRef, dateRef)) {
          return;
        }
      }
      let amanParams = [
        service.code,
        service.billing_account, // billing account is predefined
        billingAmountRef.current,
      ];
      let khalesParams = [
        service.code,
        service.billing_account, // billing account is predefined
        undefined, // no billing amount (instead, it's inside additionalData)
        additionalDataRef.current,
        dateRef.current.dateFrom,
        dateRef.current.dateTo,
      ];
      let chosenParams =
        service.provider_name === "aman" ? amanParams : khalesParams;
      setIsEnquiryLoading(true);
      runFetchEnquiry(
        fetchEnquiryServiceType,
        setErrorMsg,
        undefined,
        setIsEnquiryLoading,
        service, // can replace many things in amanParams + khalesParams using the service
        setIsChecked,
        setPrepaidEnquiryResult,
        ...chosenParams
      );
    }, 1000),
    []
  );

  const handleCheck = () => {
    setIsChecked((prev) => !prev);
    //
    let totalAmount;
    switch (type) {
      case "quick-pay-postPaid":
        dispatch(
          quickPayActions.update({
            type: "checkedPostpaidServicesEnquiries",
            value: service,
            action: !isChecked ? "add" : "remove", // !isChecked => next actions
          })
        );
        totalAmount =
          Number(service.totalAmount) || Number(service.overallPayment);
        dispatch(
          quickPayActions.update({
            type: "checkedPostpaidServicesEnquiriesTotalAmount",
            value: !isChecked ? totalAmount : -totalAmount,
          })
        );
        break;
      case "quick-pay-prePaid":
        if (prepaidEnquiryResult?.uuid) {
          dispatch(
            quickPayActions.update({
              type: "checkedPrepaidServicesEnquiries",
              value: { ...prepaidEnquiryResult, ...service },
              action: !isChecked ? "add" : "remove", // !isChecked => next action
            })
          );
          totalAmount =
            Number(prepaidEnquiryResult?.totalAmount) ||
            Number(prepaidEnquiryResult?.overallPayment);
          dispatch(
            quickPayActions.update({
              type: "checkedPrepaidServicesEnquiriesTotalAmount",
              value: !isChecked ? totalAmount : -totalAmount,
              action: "update",
            })
          );
        }

        if (isChecked) {
          setPrepaidEnquiryResult(null);
          setTopUpAmtount("");
          setChargeAmtount("");
        }

        break;
    }
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    // 1) delete from [postpaidServicesEnquiries]
    dispatch(
      quickPayActions.update({
        type: "postpaidServicesEnquiries",
        value: service,
        action: "remove",
      })
    );
    // 2) delete from [checkedPostpaidServicesEnquiries]
    dispatch(
      quickPayActions.update({
        type: "checkedPostpaidServicesEnquiries",
        value: service,
        action: "remove",
      })
    );
    //********* */ 2) delete from [PostpaidServicesEnquiries]
    // repeat the same with [checkedPostpaidServicesEnquiries]
    // 3) delete from backend (db)
    // console.log(service.uuid);
    deleteFromQuickPay(service.uuid);
  };

  return type === "quick-pay-postPaid" ? (
    <Box
      // onclick => check => add to checked postpaid enquiries
      onClick={handleCheck}
      sx={{
        width: "100%",
        bgcolor: "#F5F5F5",
        borderBottom: "1px solid #BBBBBB",
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        justifyContent: "space-between",
        paddingBottom: "6px",

        "&:hover": {
          cursor: "pointer",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          color: "#5A5A5A",
          mx: 1,
        }}
      >
        <img
          src={service.biller_image}
          width="25"
          height="25"
          style={{ borderRadius: "50%" }}
          alt={service.biller_name?.en}
        ></img>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            color: "#071E6F",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          <Box>{service.alias_name}</Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              color: "#5A5A5A",
              fontSize: "15px",
              gap: "8px",
            }}
          >
            {service.name.en}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              fontSize: "15px",
              fontWeight: "400",
              color: "#141414",
            }}
          >
            {t("billDetails.number")}:
          </Box>
          <Box
            sx={{
              color: "#5A5A5A",
              fontSize: "14px",
              fontWeight: "400",
            }}
          >
            {service.billing_account}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#141414",
            }}
          >
            <MoneySend size="20" />
            <span className="d-inline-block mx-2">
              {t("billDetails.total")}
            </span>
          </Box>
          <Box
            sx={{
              fontWeight: "600",
              color: "#5A5A5A",
              fontSize: "14px",
            }}
          >
            {/* totalAmount => aman | overallPayment => khales*/}
            {service.totalAmount || service.overallPayment}{" "}
            {t("billDetails.egp")}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center" }}
        onClick={handleDelete}
      >
        <DeleteIcon sx={{ fontSize: 27, color: "red" }} />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Checkbox
          checked={isChecked}
          autoComplete="false"
          sx={{
            "&.Mui-checked": {
              color: "#ff8e0a;",
            },
          }}
        />
      </Box>
    </Box>
  ) : "quick-pay-prepaid" ? (
    <>
      {isEnquiryLoading && <Loader type="multi-quickpay" />}
      <Box
        onClick={handleCheck}
        sx={{
          width: "100%",
          bgcolor: "#F5F5F5",
          borderBottom: "1px solid #BBBBBB",
          display: "flex",
          flexDirection: "row",
          gap: "8px",
          justifyContent: "space-between",
          paddingBottom: "6px",
        }}
      >
        {/* image */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            color: "#5A5A5A",
            mx: 1,
          }}
        >
          <img
            src={service.biller_image}
            width="25"
            height="25"
            style={{ borderRadius: "50%" }}
            alt={service.biller_name.en}
          ></img>
        </Box>
        {/* body */}
        <Box sx={{ width: "100%" }}>
          {/* alias name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              color: "#071E6F",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            <Box>{service.alias_name}</Box>
          </Box>
          {/* service name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                color: "#5A5A5A",
                fontSize: "15px",
                gap: "8px",
              }}
            >
              {service.name.en}
            </Box>
          </Box>

          {/* ********** amanInputs / khalesInputs ************** */}
          <Box>
            {service?.provider_name === "aman" ? (
              <div className="khales-form">
                {prepaidEnquiryResult?.uuid
                  ? enquiryCard(service, prepaidEnquiryResult)
                  : amanInputs(
                      "multiPayService",
                      undefined, // billingAccount is predefined in quick pay services (inside service below)
                      billingAmountRef,
                      setTopUpAmtount,
                      topUpAmtount,
                      setChargeAmtount,
                      chargeAmtount,
                      service, // charged with billingAccount (from quickPay service) => merge of (quickPay service + service details) + enquiry result)
                      debounceFn
                    )}
              </div>
            ) : (
              <div className="khales-form">
                {/* {prepaidEnquiryResult?.uuid ? enquiryResult() : khalesForm()} */}
                {prepaidEnquiryResult?.uuid
                  ? enquiryCard(service, prepaidEnquiryResult)
                  : khalesInputs(
                      "multiPayService",
                      undefined, // billingAccount is predefined in quick pay services (inside service below)
                      additionalDataRef,
                      dateRef,
                      service, // charged with billingAccount (from quickPay service) => merge of (quickPay service + service details) + enquiry result)
                      debounceFn
                    )}
              </div>
            )}
          </Box>
          {/* ************************ */}

          {errorMsg && (
            <p className="text-center mt-1 text-danger">{errorMsg}</p>
          )}
        </Box>
        {/* checkbox */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {prepaidEnquiryResult?.uuid && (
            <Checkbox
              checked={isChecked}
              autoComplete="false"
              sx={{
                "&.Mui-checked": {
                  color: "#ff8e0a;",
                },
              }}
            />
          )}
        </Box>
      </Box>
    </>
  ) : (
    ""
  );
}
