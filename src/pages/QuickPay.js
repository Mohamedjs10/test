import React, { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MoneySend } from "iconsax-react";
import { useSelector, useDispatch } from "react-redux";
import FeaturesHeader from "../components/FeaturesHeader";
import NoRecords from "../components/NoRecords";
import i18n from "../locals/i18n";
import QuickPayItem from "../components/QuickPayItem";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import {
  deleteFromQuickPay,
  fetchEnquiry,
  requestUrlTokenMultiPay,
  transactionReceiptNumGenerator,
  getServicesDetails,
} from "../utilities/apiCalls";
import { quickPayActions } from "../Redux/store";
import { dispatchCheckedPostpaidEnquiriesTotalAmount } from "../utilities/quickPayFunctions";
import { cowPay, removeCowPay } from "../utilities/paymentFunctions";

export default function QuickPay() {
  //* routing
  const navigate = useNavigate();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* redux
  const quickPay = useSelector((state) => state.quickPay.value);
  let multiPay = quickPay.multiPay;
  //^  checkedPostpaidServicesEnquiriesTotalAmount
  let checkedPostpaidServicesEnquiriesTotalAmount =
    multiPay.checkedPostpaidServicesEnquiriesTotalAmount;
  //^ checkedPrepaidServicesEnquiriesTotalAmount
  let checkedPrepaidServicesEnquiriesTotalAmount =
    multiPay.checkedPrepaidServicesEnquiriesTotalAmount;
  //* totalAmount
  let totalAmount =
    checkedPostpaidServicesEnquiriesTotalAmount +
    checkedPrepaidServicesEnquiriesTotalAmount;
  //^ postpaidServicesEnquiries
  let postpaidServicesEnquiries = multiPay.postpaidServicesEnquiries;
  //^ prepaidServicesForms
  let prepaidServicesForms = multiPay.prepaidServicesForms;
  //^ prepaidServicesEnquiries
  let prepaidServicesEnquiries = multiPay.prepaidServicesEnquiries;
  //* allServicesEnquiries
  let allServicesEnquiries =
    postpaidServicesEnquiries + prepaidServicesEnquiries; // fix => in Redux store => null => []

  //^ checkedPrepaidServicesEnquiries
  let checkedPrepaidServicesEnquiries =
    multiPay.checkedPrepaidServicesEnquiries;
  //^ checkedPrepaidServicesEnquiries
  let checkedPostpaidServicesEnquiries =
    multiPay.checkedPostpaidServicesEnquiries;
  //* allCheckedServicesEnquiries
  let allCheckedServicesEnquiries = [
    ...checkedPrepaidServicesEnquiries,
    ...checkedPostpaidServicesEnquiries,
  ];
  const userInfo = useSelector((state) => state.userInfo.value);

  const dispatch = useDispatch();
  //* states

  const [scroll, setScroll] = useState(false);
  const isLoading = postpaidServicesEnquiries?.length > 0 ? false : true;
  const [isPageLoading, setIsPageLoading] = useState(isLoading);

  const [clientQuickPay, setClientQuickPay] = useState(userInfo.quick_pay);
  const [noQuickPayData, setNoQuickPayData] = useState(
    clientQuickPay?.length === 0 ? false : true
  );
  const [servicesDetails, setServicesDetails] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState();

  const [multipay, setMultipay] = useState(true);

  const handleShowAlert = (show) => {
    setShowAlert(show);
  };
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 20);
    });
  }, []);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // function handleDeleteItem(code, uuID = null) {
  //   // setLoaded(false)
  //   const uuid = clientQuickPay.filter(
  //     (service) => service.service_code === code
  //   )[0]?.uuid;
  //   const newClientQuickPay = clientQuickPay.filter(
  //     (service) => service.uuid !== uuID
  //   );
  //   setClientQuickPay(newClientQuickPay);
  //   setNoQuickPayData(false);
  //   // const newServicesDetails = servicesDetails.filter((service) => service.code !== code);
  //   const quickPayDelete = async () => {
  //     await deleteFromQuickPay(uuID).then(() => {
  //       setServicesDetails(
  //         servicesDetails.filter((service) => service.uuid !== uuID)
  //       );
  //       // setServicesDetails(newServicesDetails);
  //     });
  //   };

  //   quickPayDelete();
  //   // setLoaded(true)
  // }
  //* pre page => inject quickPay services with more details => not used yet (will be used to delete quickPay services)
  //* not really needed, as I get uuid from quickPay, and other details from all data, which will be the same result of (getServicesDetails)
  useEffect(() => {
    if (userInfo.quick_pay) {
      const manyServ = async () => {
        const servicesCodes = clientQuickPay?.map(
          (service) => service.service_code
        );
        const services = await getServicesDetails(servicesCodes, true);
        setServicesDetails(services);
        setLoaded(true);
      };

      manyServ();
    } else {
      setNoQuickPayData(false);
      setLoaded(false);
    }
  }, []);
  //* load 1st page => get postPaidEnquiries (if found) + prePaidForms (if found)
  useEffect(() => {
    if (!(postpaidServicesEnquiries && prepaidServicesForms)) {
      let postPaidEnquiriesPromises = [];
      let postPaidEnquiries = [];
      let prePaidForms = [];
      // switch (servicesDetails?.data != undefined) {
      // switch (Object.keys(servicesDetails).length > 0) {
      switch (userInfo.quick_pay?.length > 0) {
        case true:
          //& 1) map over user quick pay services
          //^ => fill postPaidEnquiriesPromises (aman:"PAY" | khales:"POSTPAID")
          //^ => fill prePaidForms (aman:"NGO" "TOPUP" | khales:"PREPAID")
          // servicesDetails.data.map((service) => {
          userInfo.quick_pay.map((service) => {
            if (
              // if no-amount-needed service ("PAY": aman) ("POSTPAID": khales)
              service?.payment_type === "PAY" ||
              service?.payment_type === "POSTPAID"
            ) {
              let serviceType =
                service?.provider_name === "aman" ? "aman" : "khales_postpaid";
              let params = [
                serviceType,
                service.service_code,
                service.billing_account,
              ];
              // no need to push in postpaid, as we're gonna fire fetch
              // fetch enquiry for postpaid services
              postPaidEnquiriesPromises.push(fetchEnquiry(...params));
            } else {
              // if needed-amount service
              // push preloaded services, to fetch enquiry later on
              prePaidForms.push(service);
            }
          });

          //& 2) if at least one [prePaid service] is found in quick pay, so pushed in prePaidForms array
          // we start with [prePaidForms] before [postPaidEnquiriesPromises]
          // as [prePaidForms] is synchronous, so can use [setIsPageLoading(false)] down in [postPaidEnquiriesPromises]
          if (prePaidForms?.length) {
            dispatch(
              quickPayActions.update({
                type: "prepaidServicesForms",
                value: prePaidForms,
              })
            );
          }
          //& 3) if at least one [postPaid service] is found in quick pay, so pushed in postPaidEnquiriesPromises array
          if (postPaidEnquiriesPromises?.length) {
            console.log(postPaidEnquiriesPromises);
            Promise.allSettled(postPaidEnquiriesPromises).then((results) => {
              //~ inject each postPaid service enquiry with more data (from quick pay services) -----------------
              results.map((serviceEnquiry) => {
                clientQuickPay.map((quickPayService) => {
                  //~--------------------------------------------------------------------------------------------
                  if (
                    serviceEnquiry.status == "fulfilled" &&
                    serviceEnquiry.value.serviceCode ==
                      quickPayService.service_code &&
                    serviceEnquiry.value.billingAccount ==
                      quickPayService.billing_account
                  ) {
                    postPaidEnquiries.push({
                      // best to be separated // like enquiry
                      // push object of all quick pay service details (enquiry details + same quick pay service details(contain details from all... on homepage))
                      ...serviceEnquiry.value, // let what I enhance override any similar key (uuid) in supporter
                      ...quickPayService, // but here, i will need qp uuid rather than enquiry uuid, every uuid will be related to qp itself rather than its enquiry (for enquiry), but khales uuid need enquiry uui
                      enquiry: serviceEnquiry.value, //* added newly for apiCalls.js (bodyGenerator => aman => reqBody + khales uuid)
                    });
                  }
                });
              });
              dispatch(
                quickPayActions.update({
                  type: "postpaidServicesEnquiries",
                  value: postPaidEnquiries,
                  action: "set",
                })
              );
              // postPaidEnquiries are checked by default , se we add them to checkedPostpaidServicesEnquiries
              dispatch(
                quickPayActions.update({
                  type: "checkedPostpaidServicesEnquiries",
                  value: postPaidEnquiries,
                  action: "set",
                })
              );
              // send sum to redux
              dispatchCheckedPostpaidEnquiriesTotalAmount();
              setIsPageLoading(false);
            });
          } else {
            setIsPageLoading(false);
          }

          break;
        case false:
          setIsPageLoading(false);
          break;
      }
    } else {
      setIsPageLoading(false);
    }
  }, []);

  //* ---------------------
  // wont be shown only if [allServicesEnquiries.length > 0]
  const confirmPayment = () => {
    setIsPageLoading(true);
    let transactionReceiptNumGeneratorPromises = [];
    console.log(allCheckedServicesEnquiries);
    allCheckedServicesEnquiries?.map((item) => {
      transactionReceiptNumGeneratorPromises.push(
        transactionReceiptNumGenerator(
          item?.provider_name === "aman" ? "aman" : "khales_payment",
          item // service details (from list) + matched quick pay service details + enquiry result
        )
      );
    });

    console.log(transactionReceiptNumGeneratorPromises);
    Promise.allSettled(transactionReceiptNumGeneratorPromises).then(
      (results) => {
        console.log(results);
        let transactionReceiptNums = results
          ?.map((item) => item?.value?.data?.transactionReceiptNum)
          .filter((item) => typeof item === "string");
        requestUrlTokenMultiPay(transactionReceiptNums).then((res) => {
          cowPay(res.token);
          setIsPageLoading(false);
        });
      }
    );

    // Promise.allSettled(promises).then((results) => {
    //   if (results.length) {
    //     let transactionReceiptNums = results
    //       ?.map((item) => item?.value?.transactionReceiptNum)
    //       .filter((item) => typeof item === "string");

    //     RequestUrl(transactionReceiptNums);
    //     dispatch(resetAllMultiPayServices());
    //   } else {
    //     setLoading(false);
    //   }
    // });
  };
  //* ------------------------------
  useLayoutEffect(() => {
    // to remove cow pay popup on back click
    removeCowPay();
    // to reset checkedPrepaidServicesEnquiries on back click
    dispatch(
      quickPayActions.update({
        type: "checkedPrepaidServicesEnquiries",
        value: [],
        action: "set",
      })
    );
    dispatch(
      quickPayActions.update({
        type: "checkedPrepaidServicesEnquiriesTotalAmount",
        value: 0,
        action: "set",
      })
    );
  }, []);
  return (
    <>
      <div dir={t("layout.dir")} className="quickpay-section multipayform">
        <div className="container">
          <FeaturesHeader
            title={t("quickPay.quickPay")}
            icon={MoneySend}
            url="/quick-pay-add"
            multipay={multipay}
            setMultipay={setMultipay}
            type="quickpay"
          />
          {showAlert && (
            <AlertMessage
              show={handleShowAlert}
              title={alertTitle}
              message={alertMessage}
            />
          )}

          {userInfo.quick_pay?.length ? (
            <div>
              {!isPageLoading ? (
                <>
                  {/* <div
                    className={`heading-title main-title mb-2 ${t(
                      "layout.text"
                    )}`}
                    // style={{ paddingTop: "20px" }}
                  >
                    <h2>
                      {t("quickPay.totalPayment")}{" "}
                      {`( ${Number.parseFloat(totalAmount).toFixed(2)} ${t(
                        "billDetails.egp"
                      )})`}{" "}
                    </h2>
                  </div> */}

                  <div
                    className={`heading-title main-title mb-2 ${
                      scroll ? "bg-white-fixed" : "mt-5"
                    } ${t("layout.text")}`}
                  >
                    <h2>
                      {t("quickPay.totalPayment")}{" "}
                      {`( ${Number.parseFloat(totalAmount).toFixed(2)} ${t(
                        "billDetails.egp"
                      )})`}{" "}
                    </h2>
                  </div>

                  <div style={{ paddingTop: "50px" }}>
                    {postpaidServicesEnquiries?.length > 0 && (
                      <>
                        <div
                          className={`heading-title mb-2 due-to-box ${t(
                            "layout.text"
                          )}`}
                        >
                          <h2>{t("quickPay.dueBillHead")}</h2>
                        </div>
                        {postpaidServicesEnquiries?.map((service, index) => (
                          <QuickPayItem
                            service={service}
                            index={index}
                            type="quick-pay-postPaid"
                          />
                        ))}
                      </>
                    )}

                    {prepaidServicesForms?.length > 0 && (
                      <>
                        <div
                          className={`heading-title plans-box mt-4 mb-2 ${t(
                            "layout.text"
                          )}`}
                        >
                          <h2> {t("quickPay.prepaidPlanHead")}</h2>
                        </div>
                        {prepaidServicesForms?.map((service, index) => (
                          <QuickPayItem
                            service={service}
                            index={index}
                            type="quick-pay-prePaid"
                          />
                        ))}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Loader />
              )}
            </div>
          ) : (
            <NoRecords
              title={t("quickPay.noQuickPay.title")}
              text={t("quickPay.noQuickPay.text")}
            />
          )}
        </div>
        {/* {isConfirmLoading && (
          <div className="w-100" onClick={(e) => e.stopPropagation()}>
            <Loader type="multi-quickpay" id="quickpay" />
          </div>
        )} */}
        {/* {!isPageLoading && userInfo.quick_pay?.length && ( */}
        {totalAmount > 0 && (
          <div className="multi-pay-submit box-btn-bg text-center">
            <button
              className="d-block my-3 mx-auto text-white w-75"
              onClick={() => (totalAmount > 0 ? confirmPayment() : null)}
              disabled={isPageLoading || totalAmount === 0}
              style={{
                width: "50%",
                background:
                  isPageLoading || totalAmount === 0 ? "#f7b15e" : "#ff8e0a",
              }}
            >
              <>{t("billDetails.confirm")}</>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
