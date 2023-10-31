import React from "react";
import "../style/history.css";
import { useTranslation } from "react-i18next";
import i18n from "../locals/i18n";
import {
  handleURL,
  getOrderStatus,
  handleTransactionDate,
  handleNavToFetchOrderDetailsAndInquiry,
} from "../utilities/historyFunction";
export default function HistoryCard({ order, transaction }) {
  //* localization
  const { t } = useTranslation();
  return (
    <div
      style={{ cursor: "pointer" }}
      className="order"
      onClick={() => handleNavToFetchOrderDetailsAndInquiry(order, transaction)}
    >
      <p>
        <span className="category-name">
          {i18n.language === "en"
            ? transaction.biller_service?.biller?.biller_category?.name?.en
            : transaction.biller_service?.biller?.biller_category?.name?.ar}
        </span>
        <span className="date">
          {handleTransactionDate(transaction.updated_at)}
        </span>
      </p>
      <p className="b-s-name">
        <img
          src={transaction.biller_service?.biller?.image_url}
          alt={transaction.biller_service?.biller?.name?.en}
        />
        <span>
          {i18n.language === "en"
            ? transaction.biller_service?.biller?.name?.en
            : transaction.biller_service?.biller?.name?.ar}
        </span>
      </p>
      <p className="b-s-name">
        <img
          src={transaction.biller_service?.image_url}
          alt={transaction.biller_service?.name?.en}
        />
        <span>
          {i18n.language === "en"
            ? transaction.biller_service?.name?.en
            : transaction.biller_service?.name?.ar}
        </span>
      </p>
      <div className="order-info">
        <p>
          <span>
            {transaction.biller_service?.extra_data
              ? i18n.language === "en"
                ? transaction.biller_service?.extra_data?.lang?.en
                : transaction.biller_service?.extra_data?.lang?.ar
              : t("customerId.billingAccount")}
          </span>
          <span>{transaction.biller_client_national_id}</span>
        </p>
        {(transaction.extra_bill_info?.PmtId ||
          transaction.extra_bill_info?.rayaPaymentId) && (
          <p>
            <span>{`${t("customerId.billerRef")} ( ${t(
              "customerId." + transaction.payment_type
            )} )`}</span>
            <span>
              {transaction.extra_bill_info?.PmtId ||
                transaction.extra_bill_info?.rayaPaymentId}
            </span>
          </p>
        )}
        <p>
          <span>{t("billDetails.billNo")}</span>
          <span>{transaction.receipt_num}</span>
        </p>
        <p>
          <span>{t("internalCashIn.amount")}</span>
          <span>{`${transaction?.total_amount} ${t("billDetails.egp")}`}</span>
        </p>
        <p>
          <span>{t("history.orderStatus")}</span>
          <span
            className={`${order.status} status  ${getOrderStatus(
              order.status,
              transaction.status
            )}`}
          >
            {getOrderStatus(order.status, transaction.status)}
          </span>
        </p>
      </div>
    </div>
  );
}
