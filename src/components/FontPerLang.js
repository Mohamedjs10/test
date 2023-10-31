import { useState, useEffect, useLayoutEffect } from "react";
import Box from "@mui/material/Box";
import "../fonts/Agrandir-Regular.otf";
import "../fonts/BalooBhaijaan2-Regular.ttf";
import i18n from "../locals/i18n";
function FontPerLang({ children }) {
  //* routing

  //* localization
  let locale = i18n.language === "en" ? "en" : "ar";

  return (
    <Box
      sx={{
        fontFamily:
          locale === "en"
            ? "Agrandir-Regular !important"
            : "BalooBhaijaan2-Regular !important",
      }}
    >
      {children}
    </Box>
  );
}

export default FontPerLang;
