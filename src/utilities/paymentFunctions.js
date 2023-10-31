import axios from "axios";
import { store, paymentDataActions } from "../Redux/store";
import { isInQuickPay } from "../utilities/serviceFunctions";

import { tools } from "./generalUtils";

// ----------------------------------------------------------------
const redux = (slice) => {
  // to get updated slice
  return store.getState()[slice].value;
};
// ----------------------------------------------------------------

export const cowPay = (token) => {
  const script = document.createElement("script");
  script.innerHTML = `COWPAYOTPDIALOG.init();`;
  script.innerHTML += `COWPAYOTPDIALOG.load("${token}")`;
  document.body.appendChild(script);
  tools.navigate("/cow-pay-payment");
};
export const openPaymobIframe = (url) => {
  // // Create an iframe element
  // var iframe = document.createElement("iframe");

  // // Set iframe attributes
  // iframe.src = url; // Replace with the URL you want to display
  // iframe.width = "600"; // Set the width of the iframe
  // iframe.height = "400"; // Set the height of the iframe

  // // Add the iframe to the document
  // document.body.appendChild(iframe);

  window.location.href = url;
};

export const removeCowPay = () => {
  document.getElementById("cowpay-otp-container")?.remove();
};

export const handleBack = (setOpen) => {
  removeCowPay();
  if (!isInQuickPay(redux("currentService").code)) {
    setOpen(true);
    return;
  }
  tools.navigate(
    `/?lang=${tools.locale}&phone=${redux("userInfo").phone_number}&name=${
      redux("userInfo").name
    }&nationalId=${redux("userInfo").national_id}`,
    { replace: true }
  );
};

// after cowpay finished work => success or fail
export const cowPayListener = () => {
  window.addEventListener(
    "message",
    (e) => {
      // id cowpay data data arrived successfully
      if (e.data?.message_source === "cowpay") {
        store.dispatch(
          paymentDataActions.update({
            cowPayData: e.data,
          })
        );

        switch (e.data?.payment_status) {
          case "PAID":
            break;
          case "FAILED":
            break;
        }
      }
    },
    false
  );
};
