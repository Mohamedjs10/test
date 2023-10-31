import { useEffect, useRef } from "react";
import Lottie from "lottie-web";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { propTypes } from "react-bootstrap/esm/Image";

function Loader({ type, id }) {
  //* localization
  const { t } = useTranslation();
  // *
  const container = useRef(null);
  useEffect(() => {
    Lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: require("../lottieFile/loadingLottie.json"),
    });
  }, []);
  return (
    <div
      style={{
        display: type === "new-bill" ? "block" : "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: id == "quickpay" ? "column" : "row",
        position:
          type === "new-bill"
            ? "inherit"
            : type === "multi-quickpay"
            ? "fixed"
            : "absolute",
        top: "0",
        left: "0",
        width: type == "multi-quickpay" ? "100%" : "100vw",
        height:
          type === "new-bill" || type == "multi-quickpay" ? "100%" : "100vh",
        background:
          type == "multi-quickpay" ? `rgba(0, 0, 0, .2)` : "transparent",
        // background:
        //   type == "multi-quickpay"
        //     ? `rgba(234, 234, 242, ${id == "quickpay" ? "1" : "0.6"})`
        //     : "transparent",
        zIndex: 999999999,
      }}
    >
      <div
        style={{
          width: "100px",
          height: "100px",
          margin: type === "new-bill" ? "auto" : "",
          marginTop: type === "new-bill" ? "30px" : "",
        }}
        ref={container}
      ></div>
      {id == "quickpay" && (
        <p className="text-center" style={{ color: "grey" }}>
          {t("billDetails.paymentTextRedirection")}
        </p>
      )}

      {/* <div
        style={{
          opacity: type === "new-bill" || type == "multi-quickpay" ? ".2" : "1",
          width: type == "multi-quickpay" ? "100%" : "100vw",
          height:
            type === "new-bill" || type == "multi-quickpay" ? "100%" : "100vh",
          background: type == "multi-quickpay" && "black",
        }}
      ></div> */}
    </div>
  );
}

export default Loader;
