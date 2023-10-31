import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import "../style/components/AlertMessage.css";

export default function AlertMessage(props) {
  //* localization
  //* localization
  const { t } = useTranslation();
  return (
    <>
      <div
        style={{
          height: "100vh",
          position: "fixed",
          top: "0",
          background: "black",
          width: "100%",
          opacity: "0.3",
          zIndex: "1000",
        }}
      ></div>
      <Alert show={true} variant="light">
        <Alert.Heading style={{ color: "#2D317F" }}>
          {props.title}
        </Alert.Heading>
        <h6 style={{ color: "#2D317F", fontWeight: "600" }}>{props.message}</h6>
        <div className="d-flex justify-content-center w-100">
          <Button
            style={{
              width: "75%",
              backgroundColor: "#FF8E0A",
              maxWidth: "300px",
              color: "#fff",
            }}
            onClick={() => props.setAlertMessage("")}
            variant="warning"
          >
            {t("login.incorrectDataBtn")}
          </Button>
        </div>
      </Alert>
    </>
  );
}
