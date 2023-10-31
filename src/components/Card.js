// Card show Biller or service logo and name
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  dispatchToServiceSlice,
  servicePageRoute,
} from "../utilities/serviceFunctions";
import { useSelector, useDispatch } from "react-redux";
import { currentBillerActions } from "../Redux/store";
import { Link } from "react-router-dom";
import "../style/components/Card.css";

export default function Card({ type, item }) {
  const dispatch = useDispatch();

  // let currentBillerServices;
  // if (type === "service") {
  //   currentBillerServices = useSelector(
  //     (state) => state.currentBiller.value.biller_services
  //   );
  // }
  if (type === "biller") {
  }

  //* localization
  const { t } = useTranslation();

  const handleClick = () => {
    if (type === "biller") {
      dispatch(currentBillerActions.update(item));
    }
    if (type === "service") {
      dispatchToServiceSlice(item);
    }
  };

  return (
    <div className="cardS" dir={t("layout.dir")}>
      <Link
        to={
          type === "biller"
            ? "/services"
            : `${servicePageRoute(item.payment_channel_id)}`
        }
        onClick={() => handleClick()}
      >
        <div className="image">
          <img src={item.image_url} alt={item.name.en} />
        </div>
        <div className={"text " + t("layout.textAlign")}>
          <h6 className="title text-center">
            {t("layout.dir") === "ltr" ? item.name.en : item.name.ar}
          </h6>
        </div>
      </Link>
    </div>
  );
}
