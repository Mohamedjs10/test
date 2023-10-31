import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import "../style/components/BillerName.css";

export default function BillerName() {
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  //* redux
  const currentBiller = useSelector((state) => state.currentBiller.value);
  const currentService = useSelector((state) => state.currentService.value);
  const currentBillerName =
    locale === "en" ? currentBiller?.name.en : currentBiller?.name.ar;
  //*

  return (
    <div className="biller-name" dir={t("layout.dir")}>
      <span className="image">
        <img
          src={currentBiller?.image_url}
          alt={currentBiller?.name.en}
          loading="lazy"
        />
      </span>
      <span className="text">{currentBillerName}</span>
    </div>
  );
}
