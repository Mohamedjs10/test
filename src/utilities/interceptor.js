import axios from "axios";
import generateSignatureAndBody from "./hash";

//* auth
const auth = {
  username: process.env.REACT_APP_USERNAME_BASIC_AUTH,
  password: process.env.REACT_APP_PASSWORD_BASIC_AUTH,
};
//* request interceptor
export const axiosRequestInterceptor = axios.interceptors.request.use(
  async (config) => {
    // Encryption Layer -------------------------------------------------------
    const { signature, body } = await generateSignatureAndBody(config.data);
    config.data = body;
    config.headers = {
      "cp-signature": signature,
      "X-Token":
        // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImlhdCI6MTY5NTczMDM2MSwiZXhwIjoxNzI3Mjg3OTYxfQ.JCx80DB7z2UMBuIweuOn-UeY-vHlOmg_LbkZ9OY-AHE",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudF9pZCI6MSwibmFtZSI6ImNvbnRhY3QtcGF5IiwidXNlcm5hbWUiOiJjb250YWN0X3BheSIsImVtYWlsIjoieW91c3NlZi5mYXJnQGNvbnRhY3QuZWciLCJtb2JpbGVfbnVtYmVyIjoiMDExMjY3MjgxNDYiLCJpYXQiOjE2Njk1NDM3OTN9.TxSPinwqgyv4CrVvWUSMLqUdWsxSwp8mgOFMM4vEj3M",
      "X-Project-Type": "CN",
      "x-signature": signature,
    };
    config.auth = auth;
    if (
      config.url ===
      "https://contactpay-api-iframe.contact.eg/bill-payment/contact-service/v2/enquiry"
    ) {
      config.timeout = 20 * 1000;
    }
    // ------------------------------------------------------------------------
    return config;
  },
  (error) => Promise.reject(error)
);

//* response interceptor
// export const axiosResponseInterceptor = axios.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   (error) => Promise.reject(error)
// );
