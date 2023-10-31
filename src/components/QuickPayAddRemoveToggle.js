import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import { useRouter } from 'next/navigation';

import {
  userInfoActions,
  allCategoriesBillersServicesActions,
  paymentDataActions,
} from "../Redux/store";
import { useEffect, useState, forwardRef } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useSelector, useDispatch } from "react-redux";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import { isInQuickPay } from "../utilities/serviceFunctions";
import "../style/components/favoriteAdd.css";
import { addQuickPayService } from "../utilities/serviceFunctions";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function QuickPayAddRemoveToggle({
  type,
  isChecked,
  setIsChecked,
  open,
  setOpen,
}) {
  //* routing
  const navigate = useNavigate();
  //* localization
  const { t } = useTranslation();
  let locale = i18n.language === "en" ? "en" : "ar";
  console.log(locale);
  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const currentService = useSelector((state) => state.currentService.value);
  // serviceName = only needed if => (type === "checkbox") => so we made ?. not to make errors on other types where currentService has no value
  const serviceName =
    locale === "en"
      ? currentService?.serviceName?.en
      : currentService?.serviceName?.ar;
  const paymentData = useSelector((state) => state.paymentData.value);
  const dispatch = useDispatch();
  //*
  const [aliasName, setAliasName] = useState("");
  const [isAliasInputShown, setIsAliasInputShown] = useState(false);

  const handleSubmit = async () => {
    setOpen(false);
    // => navigate to home
    navigate(
      `/?lang=${locale}&phone=${userInfo.phone_number}&name=${userInfo.name}&nationalId=${userInfo.national_id}`,
      { replace: true }
    );
    addQuickPayService(aliasName, serviceName); // serviceName => could be removed from here =, and get from redux inside
  };
  const handleAdd = () => {
    setIsAliasInputShown(true);
  };
  const handleSkip = () => {
    setOpen(false);
    // => navigate to home
    navigate(
      `/?lang=${locale}&phone=${userInfo.phone_number}&name=${userInfo.name}&nationalId=${userInfo.national_id}`,
      { replace: true }
    );
  };

  return type === "checkbox" ? (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={() => setIsChecked((prev) => !prev)}
          />
        }
        label={t("quickPay.checkbox")}
      />
    </>
  ) : (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setOpen(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        {!isAliasInputShown && (
          <>
            <DialogTitle sx={{ color: "#2d317f" }}>
              {"Want To Add It To Your Quickpay"}
            </DialogTitle>
            <DialogActions>
              <Button
                variant="contained"
                onClick={handleSkip}
                sx={{
                  bgcolor: "#f5f5f5",
                  color: "#2d317f",
                  m: 1,
                  "&:hover": {
                    color: "#fff",
                  },
                }}
              >
                Skip
              </Button>
              <Button
                variant="contained"
                onClick={handleAdd}
                sx={{ bgcolor: "#f58220", m: 1 }}
              >
                Add
              </Button>
            </DialogActions>
          </>
        )}
        {isAliasInputShown && (
          <>
            <DialogTitle sx={{ color: "#2d317f" }}>
              {"Want To Add It To Your Quickpay"}
            </DialogTitle>
            <DialogActions>
              <TextField
                id="outlined-basic"
                label={t("quickPay.aliasNameText")}
                variant="outlined"
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ bgcolor: "#f58220", m: 1, width: "90px !important" }}
              >
                Submit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
