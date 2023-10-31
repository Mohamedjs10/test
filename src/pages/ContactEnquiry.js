import { useEffect, useLayoutEffect, useState } from "react";
// import { colors } from "../utils/const";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";

// import "./homePage.css";
import { useSelector, useDispatch } from "react-redux";

import Card from "../components/Card";
import BillerName from "../components/BillerName";

// import "../style/biller.css";

export default function Biller(type, item) {
  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const currentBillerServices = useSelector(
    (state) => state.currentBiller.value.biller_services
  );

  //* localization
  const { t } = useTranslation();

  //* useLayoutEffect
  //   useEffect(() => {
  //     if (router.isReady == true) {
  //       const {
  //         slug: [catIndex, billerIndex],
  //       } = router.query;
  //       setCurrentBillerServices(
  //         allCategoriesBillersServices[catIndex].billers[billerIndex]
  //           .biller_services
  //       );
  //     }
  //   }, [router.isReady]);
  // saved from Home page (payment services)
  //   const clientData = useSelector((state) => state.client.data);
  //   const allServices = useSelector((state) => state.allServices.data);
  //^ ----------------------------------------------------------------------

  return (
    <div dir={t("layout.dir")} className="biller">
      <div className="container">
        <BillerName />
        <div className="services">
          {currentBillerServices.map((service, index) => (
            <Card type="service" item={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
