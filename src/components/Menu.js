// Card show Biller or service logo and name
import { useEffect, useLayoutEffect, useState } from "react";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  getAllCategoriesBillersServices,
  getUserInfo,
} from "../utilities/apiCalls";
// import "./homePage.css";
import { useSelector, useDispatch } from "react-redux";
import {
  userInfoActions,
  allCategoriesBillersServicesActions,
} from "../Redux/store";
import Dropdown from "react-bootstrap/Dropdown";
import { Category } from "iconsax-react";
import { RefreshLeftSquare } from "iconsax-react";
import { MoneySend } from "iconsax-react";
import { Heart } from "iconsax-react";
// import "./Menu.css";
import Box from "@mui/material/Box";
import FontPerLang from "../components/FontPerLang";
import "../style/components/Menu.css";

export default function Menu() {
  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const allCategoriesBillersServices = useSelector(
    (state) => state.allCategoriesBillersServices.value
  );
  const dispatch = useDispatch();

  //* states
  const [loaded, setLoaded] = useState(false);
  const [favoriteIcon, setfavoriteIcon] = useState("props.inFavorite");
  //* routing
  const navigate = useNavigate();
  // searchParams.delete("phone");
  // navigate(`/`, { replace: true });

  //* localization
  const { t } = useTranslation();

  const handleUrl = (url) => {
    navigate(url);
  };
  return (
    <Dropdown dir={t("layout.dir")}>
      <Dropdown.Toggle id="dropdown-basic">
        <Box
          sx={{
            display: "flex",
            color: "#2D317F",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          <Category size="28" color="#2D317F" />
          <Box sx={{ pt: "3px" }}>{t("quickPay.menuText")}</Box>
        </Box>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleUrl("/client-history")}>
          <RefreshLeftSquare size="28" color="#2D317F" />
          {t("quickPay.history")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleUrl("/quick-pay")}>
          <MoneySend size="28" color="#2D317F" />
          {t("quickPay.quickPay")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
