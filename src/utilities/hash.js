import * as bcrypt from "bcryptjs";
const CryptoJS = require("crypto-js");

const createHmacString = (privateKey, message) => {
  const key = CryptoJS.enc.Utf8.parse(privateKey);
  const timestamp = CryptoJS.enc.Utf8.parse(message);
  const hmac = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(timestamp, key));
  return hmac;
};

export default async function generateSignatureAndBody(oldReqBody) {
  // TODO: env file
  const API_KEY = process.env.REACT_APP_API_KEY;
  const CIPHER_KEY = process.env.REACT_APP_CIPHER_KEY;
  const randomSaltForHashing = await bcrypt.genSalt(10);

  // hash api
  const API_KEY_HASHED = await bcrypt.hash(API_KEY, randomSaltForHashing);
  const bodyWithHashKey = { ...oldReqBody, API_KEY_HASHED };
  const signature = createHmacString(
    CIPHER_KEY,
    JSON.stringify(bodyWithHashKey)
  );

  return { signature, body: bodyWithHashKey };
}
