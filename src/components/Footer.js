import React from "react";
import i18n from "../locals/i18n";
import "../style/components/footer.css";

export default function Footer() {
  return (
    <div
      className={
        i18n.language === "en"
          ? "footer justify-content-end"
          : "footer justify-content-start"
      }
    >
      Powered By:
      <img
        src="https://image-solution-no-scale.s3.us-east-2.amazonaws.com/upload/amanLogo.png"
        alt="aman logo"
        loading="lazy"
      />
      <img
        src="https://image-solution-no-scale.s3.us-east-2.amazonaws.com/upload/khales-logo.jpeg"
        className="khales-img"
        alt="khales logo"
        loading="lazy"
      />
    </div>
  );
}
