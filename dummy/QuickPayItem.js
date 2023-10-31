const amanForm = () => {
  if (service.payment_type === "TOPUP" || "NGO") {
    if (service?.extra_data?.packages) {
      return (
        <div className="d-flex justify-content-start w-100  mb-1">
          <label style={{ width: "120px" }} className="d-inline-block mt-1">
            {t("packageChoose")}:
          </label>
          <select
            readOnly={false}
            required
            style={{ height: "35px", width: "40%", padding: "3px" }}
            className={`input-box-${service.uuid}`}
            onClick={(e) => e.stopPropagation()}
            // onKeyUp={debounceFetchEnquiry}
            autoComplete="false"
            onChange={(e) => {
              handleInputChange(e, "am-package", {
                uuid: props?.uuid,
                key: "amount",
                value: +e.target.value,
              });
              debounceFn(e);
            }}
          >
            <option value="" disabled selected>
              {t("packageChoose")}
            </option>
            {service?.extra_data?.packages?.map((packge, index) => (
              <option key={index} value={packge.value}>
                {i18n.language === "ar" ? packge.name.ar : packge.name.en}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      // if to enter the value manually
      return service?.biller_category_id === 3 ? (
        <div className="d-flex justify-content-start w-100  mb-1">
          <label style={{ width: "120px" }} className="d-inline-block mt-1">
            {t("khales.amt")}:
          </label>
          <div
            className="d-flex justify-content-center form-charge-aman"
            style={{ width: "100%" }}
          >
            <input
              style={{
                height: "35px",
                width: "40%",
                padding: "3px",
              }}
              required
              type="text"
              // onClick={(e) => e.stopPropagation()}
              className={`input-box-${service.uuid}`}
              // onKeyUp={debounceFetchEnquiry}
              readOnly={false}
              value={topUpAmtount}
              name="billingAmount"
              placeholder={t("khales.topUpAmt")}
              onChange={(e) => {
                handleTopUpChange(e);
                debounceFn(e);
              }}
            ></input>
            <div className="d-flex justify-content-center flex-column mx-1">
              <ArrowSwapHorizontal size="18" color="#FF8A65" />
            </div>
            <input
              style={{
                height: "35px",
                width: "40%",
                padding: "3px",
              }}
              required
              onClick={(e) => e.stopPropagation()}
              className={`input-box-${service.uuid}`}
              readOnly={false}
              type="text"
              value={chargeAmtount}
              name="billingAmount"
              placeholder={t("khales.chargeAmt")}
              onChange={(e) => {
                handleChargeChange(e);
                debounceFn(e);
              }}
            ></input>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-start w-100  mb-1">
          <label style={{ width: "120px" }} className="d-inline-block mt-1">
            {t("khales.amt")}:
          </label>
          <input
            readOnly={false}
            style={{ height: "35px", width: "40%", padding: "3px" }}
            className={`input-box-${service.uuid}`}
            required
            type="number"
            name="billingAmount"
            onClick={(e) => e.stopPropagation()}
            autoComplete="false"
            onChange={(e) => {
              handleInputChange(e, "am-amount", {
                uuid: props.uuid,
                key: "amount",
                value: +e.target.value,
              });
              debounceFn(e);
            }}
          ></input>
        </div>
      );
    }
  } else {
    return null;
  } // ===> PAY ===> value not needed (phone bill)
};

const khalesForm = () => {
  let inputs = [];
  console.log(inputs);

  service?.extra_data?.packages &&
    inputs.push(
      <div className="d-flex justify-content-start w-100 mb-1">
        <label
          style={{ width: "120px" }}
          className="d-inline-block mt-1"
        ></label>
        <select
          readOnly={false}
          required
          style={{ width: "45%" }}
          className={`input-box-${service.uuid}`}
          autoComplete="false"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            handleInputChange(e, "kh-package", {
              uuid: service.uuid,
              key: "amount",
              value: +e.target.value,
            });
            debounceFn(e);
          }}
        >
          {service?.extra_data?.packages?.map((packge, index) => (
            <option key={index} value={packge.value}>
              {i18n.language === "ar" ? packge.name.ar : packge.name.en}
            </option>
          ))}
        </select>
      </div>
    );

  service?.extra_data?.postBillingAccount &&
    inputs.push(
      <div className="d-flex justify-content-start w-100  mb-1">
        <label style={{ width: "120px" }} className="d-inline-block mt-1">
          {service?.extra_data?.postBillingAccount?.display?.[i18n.language]}:
        </label>
        <input
          readOnly={false}
          style={{ height: "35px", width: "40%", padding: "3px" }}
          className={`input-box-${service.uuid}`}
          required
          type={
            ["count", "amount"].includes(
              service?.extra_data?.postBillingAccount.name
            )
              ? "number"
              : "text"
          }
          name={service?.extra_data?.postBillingAccount.name}
          onClick={(e) => e.stopPropagation()}
          autoComplete="false"
          onChange={(e) => {
            handleInputChange(e, "kh-postBill", {
              uuid: service?.uuid,
              key: service?.extra_data?.postBillingAccount?.name,
              value: ["count", "amount"].includes(
                service?.extra_data.postBillingAccount.name
              )
                ? +e.target.value
                : e.target.value,
            });
            debounceFn(e);
          }}
        ></input>
      </div>
    );

  service?.extra_data?.preBillingAccount &&
    inputs.push(
      <div className="d-flex justify-content-start w-100  mb-1">
        <label style={{ width: "120px" }} className="d-inline-block mt-1">
          {service?.extra_data?.preBillingAccount?.display?.[i18n.language]}:
        </label>
        <input
          readOnly={false}
          style={{ height: "35px", width: "40%", padding: "3px" }}
          className={`input-box-${service.uuid}`}
          required
          type={
            ["count", "amount"].includes(
              service?.extra_data?.preBillingAccount?.name
            )
              ? "number"
              : "text"
          }
          name={service?.extra_data?.preBillingAccount?.name}
          onClick={(e) => e.stopPropagation()}
          autoComplete="false"
          onChange={(e) => {
            handleInputChange(e, "kh-preBill", {
              uuid: service?.uuid,
              key: service?.extra_data?.preBillingAccount.name,
              value:
                service?.extra_data.preBillingAccount.name === "count"
                  ? +e.target.value
                  : e.target.value,
            });
            debounceFn(e);
          }}
        ></input>
      </div>
    );

  service?.extra_data?.additionalInfo &&
    service?.extra_data?.additionalInfo?.map((info, i) => {
      inputs.push(
        <div key={i} className="d-flex justify-content-start w-100  mb-1">
          <label style={{ width: "120px" }} className="d-inline-block mt-1">
            {info.display?.[i18n.language]}:
          </label>
          <input
            readOnly={false}
            style={{ height: "35px", width: "40%", padding: "3px" }}
            className={`input-box-${service.uuid}`}
            required
            type={["count", "amount"].includes(info.name) ? "number" : "text"}
            name={info.name}
            onClick={(e) => e.stopPropagation()}
            autoComplete="false"
            onChange={(e) => {
              handleInputChange(e, `kh-addInfo${i}`, {
                uuid: service.uuid,
                key: info.name,
                value: ["count", "amount"].includes(info.name)
                  ? +e.target.value
                  : e.target.value,
              });
              debounceFn(e);
            }}
          ></input>
        </div>
      );
    });

  service?.extra_data?.DateFrom &&
    inputs.push(
      <div className="date-from">
        <input
          readOnly={false}
          required
          ref={fromRef}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => (fromRef.current.type = "date")}
          onBlur={() => (fromRef.current.type = "text")}
          placeholder={t("history.from")}
          type="text"
          autoComplete="false"
          onChange={(e) => {
            handleInputChange(e, "dateFrom", {
              uuid: service.uuid,
              key: "dateFrom",
              value: e.target.value,
            });
            debounceFn(e);
          }}
        ></input>
      </div>
    );

  service?.extra_data?.DateTo &&
    inputs.push(
      <div className="date-to">
        <input
          readOnly={false}
          required
          ref={toRef}
          onFocus={() => (toRef.current.type = "date")}
          onBlur={() => (toRef.current.type = "text")}
          placeholder={t("history.to")}
          type="text"
          onClick={(e) => e.stopPropagation()}
          autoComplete="false"
          onChange={(e) => {
            handleInputChange(e, "kh-dateTo", {
              uuid: service.uuid,
              key: "dateTo",
              value: e.target.value,
            });
            debounceFn(e);
          }}
        ></input>
      </div>
    );

  return inputs;
};

// ***********

// "PAY" => no amount needed => no amount input needed => direct fetch enquiry
// "TOPUP" | "NGO" => => amount needed => amount input needed => enter amount => then fetch enquiry
//
// totalAmount = payment amount (amount) + total fees
//  total fees = fees + vat
//& some services use (id === 59 + 63) [top up amount], while the others use [charge amount]
//& so, we create amountVal state to hold the appropriate amount value type (top up or charge) to be used for fetching enquiry for different services
const [amountVal, setAmountVal] = useState(null);
// const [topUpAmtount, setTopUpAmtount] = useState(""); // balance (top up) amount => 7    [use to fetch enquiry for all services]
// const [chargeAmtount, setChargeAmtount] = useState(""); // payment (charge) amount => 10 [use to fetch enquiry only for (id === 59 + 63)]
