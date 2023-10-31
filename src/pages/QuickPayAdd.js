import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MoneySend } from "iconsax-react";
import FeaturesHeader from "../components/FeaturesHeader";
import AddFavQuickServ from "../components/AddFavQuickServ";

export default function AddQuickPay() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div dir={t("layout.dir")}>
      <div className="container">
        <FeaturesHeader
          title={t("quickPay.addToQuickPay")}
          icon={MoneySend}
          add={true}
        />
        <AddFavQuickServ type="quickPay" />
      </div>
    </div>
  );
}
