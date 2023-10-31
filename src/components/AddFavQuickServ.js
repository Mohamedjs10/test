import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import i18n from "../locals/i18n";
import { addQuickPayService } from "../utilities/serviceFunctions";
import { quickPayActions } from "../Redux/store";
import "../style/components/favoriteAdd.css";

import AlertMessage from "../components/AlertMessage";

export default function AddFavorite(props) {
  const type = props.type;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //* redux
  const categories = useSelector(
    // allCategoriesBillersServices
    (state) => state.allCategoriesBillersServices.value
  );
  //* states
  // -------------------- (displayed) billers + services based on selected category --------------------
  const [billers, setBillers] = useState(categories[0].billers); //^^^^^^^^^^^^^^^^^^^^^^^^^
  const [services, setServices] = useState(billers[0].biller_service);
  // -------------------- (css) selected category + biller --------------------
  const [selectedCategory, setSelectedCategory] =
    useState("Telecom & Internet");
  const [selectedBiller, setSelectedBiller] = useState("Etisalat"); //^^^^^^^^^^^^^^^^^^^^^^^^^
  // -------------------- required inputs --------------------
  const [serviceCode, setServiceCode] = useState("");
  const [billingAccount, setBillingAccount] = useState("");
  const [aliasName, setAliasName] = useState("");
  //********* */
  const [isLoading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [categoryIndex, setCategoryIndex] = useState();
  const [place, setPlaceHolder] = useState(t("billDetails.enterNumber"));

  const handleServiceChange = (e) => {
    const service = JSON.parse(e.target.value);
    // 1) set placeHolder
    let placeHolder =
      service.provider_name === "khales"
        ? service?.extra_data?.billingAccount?.[i18n.language]
        : service?.extra_data?.lang !== undefined
        ? service?.extra_data?.lang?.[i18n.language]
        : t("billDetails.enterNumber");
    setPlaceHolder(placeHolder);
    // 2) set service code
    setServiceCode(service.code);
  };
  const displayBillersBasedOnCategory = (CategoryId, catIndex) => {
    const categoryBillers = categories.filter((cat) => cat.id === CategoryId)[0]
      .billers;
    setBillers(categoryBillers);
    setCategoryIndex(catIndex);
    getServicesBasedOnBiller(0, catIndex);
  };

  const getServicesBasedOnBiller = (billerIndex, catIndex) => {
    setServices(categories[catIndex].billers[billerIndex].biller_services);
  };
  // Save service to Quick pay
  const handleShowAlert = (show) => {
    setAlertMessage("");
  };

  const handleSave = () => {
    setLoading(true);

    if (!/^[0-9]*$/.test(billingAccount)) {
      setAlertMessage(t("billDetails.billingMustNumber"));
      return;
    }
    if (
      // serviceElement === "notService" ||
      !billingAccount ||
      !serviceCode ||
      !aliasName
    ) {
      setAlertMessage(t("billDetails.mustEnterData"));
    } else {
      addQuickPayService(
        aliasName,
        // serviceName,
        billingAccount,
        serviceCode
      ).then(() => {
        setAlertMessage(t("billDetails.serviceAdded"));
        setBillingAccount("");
        setAliasName("");
        // invoke a new quickPay api call
        // dispatch(
        //   quickPayActions.update({
        //     type: "postpaidServicesEnquiries",
        //     value: [],
        //     action: "set",
        //   })
        // );
        // dispatch(
        //   quickPayActions.update({
        //     type: "prepaidServicesForms",
        //     value: null,
        //   })
        // );
        navigate(-1);
      });
    }
  };

  useEffect(() => {
    displayBillersBasedOnCategory(3, 0);
  }, []);

  return (
    <div dir={t("layout.dir")} style={{ position: "relative" }}>
      {alertMessage && (
        <AlertMessage
          show={handleShowAlert}
          setAlertMessage={setAlertMessage}
        />
      )}
      <div className="categories">
        {categories &&
          categories?.map((category, index) => (
            <p
              className={category.name.en == selectedCategory ? "active" : ""}
              onClick={(e) => {
                setPlaceHolder(t("billDetails.enterNumber"));
                setSelectedCategory(category.name.en);
                setSelectedBiller(category.billers[0].name.en); // select 1st biller card by default
                displayBillersBasedOnCategory(category.id, index);
              }}
              key={category.id}
            >
              {i18n.language === "en" ? category.name.en : category.name.ar}
            </p>
          ))}
      </div>
      <div className="billers">
        {billers &&
          billers?.map((biller, index) => (
            <p
              className={biller.name.en == selectedBiller ? "active" : ""}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                getServicesBasedOnBiller(index, categoryIndex);
                setSelectedBiller(biller.name.en);
              }}
              key={biller.id}
            >
              <img src={biller.image_url} alt={biller.name.en} loading="lazy" />
              <span>
                {i18n.language === "en" ? biller.name.en : biller.name.ar}
              </span>
            </p>
          ))}
      </div>
      <div className="service mb-4 text-center inputs">
        <p>{t("billDetails.selectService")}</p>
        <select defaultValue="notService" onChange={handleServiceChange}>
          <option key="100" value="notService" disabled>
            {t("billDetails.selectService")}
          </option>
          {services &&
            services?.map((service, index) => (
              <option key={index} value={JSON.stringify(service)}>
                {i18n.language === "en" ? service.name.en : service.name.ar}
              </option>
            ))}
        </select>
        {type === "quickPay" ? (
          <Fragment>
            <div className="billing-account">
              <p>{t("billDetails.enterAccountNumber")}</p>
              <input
                onChange={(e) => setBillingAccount(e.target.value)}
                required
                type="text"
                placeholder={place}
                value={billingAccount}
              />
            </div>
            <div className="nickname">
              <p>{t("billDetails.enterServiceName")}</p>
              <input
                onChange={(e) => setAliasName(e.target.value)}
                type="text"
                placeholder={t("billDetails.enterName")}
              />
            </div>
          </Fragment>
        ) : (
          ""
        )}
      </div>

      <button
        style={{
          display: "block",
          margin: "auto",
          color: "white",
          background:
            isLoading || !billingAccount || !serviceCode || !aliasName
              ? "rgb(239 198 150)"
              : "#ff8e0a",
        }}
        onClick={() => (!isLoading ? handleSave() : null)}
        disabled={isLoading || !billingAccount || !serviceCode || !aliasName}
      >
        {isLoading ? t("billDetails.wait") : t("billDetails.save")}
      </button>
    </div>
  );
}
