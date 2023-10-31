import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "../style/aman.css";
import i18n from "../locals/i18n";
import "../style/aman.css";
import "../style/service.css";
import imgDetailtsImg from "../images/bill-details.svg";
import noBillImage from "../images/no-bill.svg";

import {
  transactionReceiptNum,
  urlRequestultiPay,
  addClient,
} from "../functions/apiCalls";
import { fetchEnquiry } from "../functions/apiCalls";
import Loader from "../components/Loader";

export default function MultiPay() {
  const clientData = useSelector((state) => state.client.data);
  const { services } = useSelector((state) => state.multiPayServices);
  const clientParameter = useSelector(
    (state) => state.client.data.urlParameters
  );

  const { t } = useTranslation();

  let navigate = useNavigate();
  const [successResult, setSuccessResult] = useState(false);
  const [enquiryRes, setEnquiryResult] = useState();
  const [errorAlert, SetErrorAlert] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [totalAmount, setTotalAmount] = useState();
  const [clientID, setClientID] = useState();

  useEffect(() => {
    setLoaded(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const promises = services?.map(async (item) => {
      let item_data = { ...item };

      let DateFrom = item_data.service_data?.dataFrom;
      let DateTo = item_data.service_data?.dataTo;
      delete item_data.dataTo;
      delete item_data.dataFrom;

      let reqBody =
        item_data.provider_name === "aman"
          ? {
              serviceCode: item_data.code,
              billingAccount: item_data.account,
              amount: item_data?.service_data?.amount
                ? item_data?.service_data?.amount
                : null,
            }
          : {
              serviceCode: item_data.code,
              billingAccount: item_data.account,
              additionalData: item_data.service_data,
              DateFrom: DateFrom ? DateFrom : "false",
              DateTo: DateTo ? DateTo : "false",
            };
      return {
        data: await fetchEnquiry({
          reqBody,
          serviceType:
            item_data.provider_name === "aman"
              ? "aman"
              : item_data.payment_type === "PREPAID"
              ? "khales_prepaid"
              : "khales_postpaid",
        }),
        service_data: item_data,
      };
    });

    Promise.allSettled(promises).then((results) => {
      if (results?.length) {
        let enquiries = results?.filter((item) => item?.value?.data?.uuid);
        if (enquiries?.length) {
          const sum = enquiries.reduce((accumulator, object) => {
            return (
              accumulator +
              (object.value.data.providerName === "khales"
                ? +object.value.data.overallPayment
                : +object.value.data.totalAmount)
            );
          }, 0);
          setTotalAmount(sum);
          setEnquiryResult(enquiries);
        } else {
          SetErrorAlert(true);
        }
      }
      setSuccessResult(true);
      setLoaded(true);
    });

    addClient({
      phone_number: clientData.phone_number,
      national_id: clientData.national_id,
      name: clientData.name,
    }).then((res) => setClientID(res?.client_id));
  }, []);

  const confirmPayment = async () => {
    setLoading(true);

    const promises = enquiryRes?.map(async (item) => {
      let aman_data = {};
      if (item?.value.data?.providerName === "aman") {
        aman_data = { ...item.value.data };
        aman_data.paymentMethodId = 1;
        delete aman_data.providerName;
      }

      let reqBody =
        item?.value?.data?.providerName === "aman"
          ? aman_data
          : {
              serviceCode: item?.value?.service_data?.code,
              EPayBillRecID: item?.value?.data?.EPayBillRecID,
              billingAccount:
                item?.value?.service_data?.code === "55570"
                  ? item?.value?.service_data?.account
                  : item?.value?.data?.customerData?.customerCode,
              billNumber: item?.value?.data?.billNumber,
              amount: Number(item?.value?.data?.amount),
              fees: +item?.value?.data?.feesAmount,
              uuid: item?.value?.data?.uuid,
              BillRefInfo: item?.value?.data?.BillRefInfo,
              khalesPaymentSequence: item?.value?.data?.khalesPaymentSequence,
              khalesEnquiryRefSignedData:
                item?.value?.data?.khalesEnquiryRefSignedData,
              DateTo:
                item?.value?.data?.DateTo === "false"
                  ? "false"
                  : services.filter(
                      (item) => item.uuid === item?.value?.service_data?.uuid
                    )[0]?.service_data?.dataTo,
              DateFrom:
                item?.value?.data?.DateFrom === "false"
                  ? "false"
                  : services.filter(
                      (item) => item.uuid === item?.value?.service_data?.uuid
                    )[0]?.service_data?.dataFrom,
              attachedLogId: +item?.value?.data?.attachedLogId,

              vat: item?.value?.data?.vat.toString(),
              paymentMethodId: 1,
              billerDetails: item?.value?.data?.billerDetails,
            };

      return transactionReceiptNum({
        reqBody,
        serviceType:
          item.value?.data?.providerName === "khales"
            ? "khales_payment"
            : "aman",
      });
    });

    Promise.allSettled(promises).then(async (results) => {
      if (results.length) {
        let transactionReceiptNums = results?.map(
          (item) => item?.value?.transactionReceiptNum
        );

        let receiptNums = transactionReceiptNums.filter(
          (item) => typeof item === "string"
        );
        await RequestUrl(receiptNums);
      } else {
        setLoading(false);
      }
    });
  };

  async function RequestUrl(receiptNum) {
    const urlReq = async () => {
      const data = await urlRequestultiPay({
        receipt_numbers: receiptNum,
        payment_method_id: +1,
        client_id: clientID,
      });
      cowPay(data.token);
      setLoading(false);
    };
    urlReq();
  }
  function cowPay(token) {
    const script = document.createElement("script");
    script.innerHTML = `COWPAYOTPDIALOG.init();`;
    script.innerHTML += `COWPAYOTPDIALOG.load("${token}")`;
    document.body.appendChild(script);
    // still cowpay present in the front, and navigate the bg
    navigate("/cowPayPayment");
  }

  return (
    <div className="aman" dir={t("layout.dir")}>
      <div className="container">
        <div className="service-name">
          <div className="image">
            <img src={imgDetailtsImg} alt="bill details" />
          </div>
          <div>
            <p>{t("billDetails.review")}</p>
          </div>
        </div>
        {errorAlert && loaded && !enquiryRes?.length && (
          <div>
            <div className="container">
              <div className="error-bill mt-3 py-5">
                <div className="image box m-auto">
                  <img
                    src={noBillImage}
                    className="m-auto d-block"
                    alt="no bill yet"
                  />
                </div>
                <h6 className="mt-3 text-center">{t("billDetails.noBill")}</h6>
              </div>
            </div>
            <button
              className="m-auto d-block w-50 text-white"
              onClick={() =>
                navigate("/?" + clientParameter, { replace: true })
              }
            >
              {t("billDetails.badRequesrError")}
            </button>
          </div>
        )}
        {successResult && loaded && (
          <>
            {enquiryRes?.length &&
              enquiryRes?.map((item, index) => (
                <div className="enquiry-result mb-2" key={index}>
                  <div
                    className={`d-flex flex-column flex-start mb-3 ${t(
                      "layout.textAlign"
                    )}`}
                    sx={{ textAlign: t("layout.textAlign") }}
                  >
                    <h5
                      style={{
                        marginBottom: "0px",
                        fontWeight: 700,
                        color: "#071E6F",
                      }}
                    >
                      {item?.value?.service_data?.biller?.name?.[i18n.language]}
                    </h5>
                    <div className="mt-2">
                      <img
                        width="25px"
                        src={item?.value?.service_data?.biller?.image_url}
                        alt={
                          item?.value?.service_data?.biller?.name?.[
                            i18n.language
                          ]
                        }
                      />
                      <span className="d-inline-block mx-2">
                        {item?.value?.service_data?.name?.[i18n.language]}
                      </span>
                    </div>
                  </div>

                  <div className="billDetails d-flex justify-content-center">
                    <div className="details">
                      <div className="biller-account s-line">
                        <p>{t("billDetails.custCode")}</p>
                        <p>{item?.value?.service_data?.account}</p>
                      </div>

                      <div className="amount">
                        <span>{t("billDetails.dueAmount")}</span>
                        <span>
                          {item?.value?.data?.amount + t("billDetails.egp")}
                        </span>
                      </div>
                      <div className="fees">
                        <span>{t("billDetails.serviceFees")}</span>
                        <span>
                          {item?.value?.data?.totalFees + t("billDetails.egp")}
                        </span>
                      </div>
                      <div className="total">
                        <span id="total-amount">{t("billDetails.total")}</span>
                        <span>
                          {item?.value?.data?.providerName === "khales"
                            ? item?.value?.data?.overallPayment
                            : item?.value?.data?.totalAmount}
                          {t("billDetails.egp")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {successResult && loaded && enquiryRes?.length && (
              <button
                className="mt-2 confirm-pay text-white w-75"
                onClick={() => (!isLoading ? confirmPayment() : null)}
                disabled={isLoading}
              >
                {isLoading ? (
                  t("billDetails.wait")
                ) : (
                  <>
                    {t("billDetails.confirm")} ( {totalAmount}{" "}
                    {t("billDetails.egp")})
                  </>
                )}
              </button>
            )}
          </>
        )}
        {!loaded && <Loader />}
      </div>
    </div>
  );
}
