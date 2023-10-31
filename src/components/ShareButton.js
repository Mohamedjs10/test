import { useState, useEffect, useLayoutEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import DialogTitle from "@mui/material/DialogTitle";
import ShareButtons from "./ShareButtons";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
export default function ShareButton() {
  //* localization
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // <Button sx={{margin:0 , color:"black"}} variant="contained" onClick={handleClickOpen}>
  //   Share
  // </Button>

  return (
    <>
      <button onClick={handleClickOpen} disabled>
        {t("billDetails.share")}
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Share to:"}</DialogTitle>
        <DialogContent>
          <ShareButtons></ShareButtons>
        </DialogContent>
      </Dialog>
    </>
  );
}
