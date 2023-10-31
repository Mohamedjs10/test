import { useEffect, useLayoutEffect, useState } from "react";
import { axiosRequestInterceptor } from "../utilities/interceptor";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import "../style/pages/home-page.css";
import Loader from "../components/Loader";
import Menu from "../components/Menu";
import { useSearchParams } from "react-router-dom";
import i18n from "../locals/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { tools } from "../utilities/generalUtils";
import {
  getAllCategoriesBillersServices,
  getUserInfo,
  getUserHistory,
} from "../utilities/apiCalls";
import {
  userInfoActions,
  allCategoriesBillersServicesActions,
  currentBillerActions,
  historyOrdersActions,
} from "../Redux/store";
import { quickPayEnhancer } from "../utilities/quickPayFunctions";
import { homePageDate } from "../utilities/staticContent";
export default function HomePage() {
  // ----------------------------
  //* states
  const [loaded, setLoaded] = useState(false);
  //* redux
  const userInfo = useSelector((state) => state.userInfo.value);
  const allCategoriesBillersServices = useSelector(
    (state) => state.allCategoriesBillersServices.value
  );
  // const allCategoriesBillersServices = homePageDate;
  const historyOrders = useSelector((state) => state.historyOrders.value);

  const dispatch = useDispatch();

  //* routing
  const [searchParams, setSearchParams] = useSearchParams();
  // even if (+) is written before number => will not be not visible
  const phone = `+${searchParams.get("phone")?.trim()}`;
  const nationalId = searchParams.get("nationalId")?.trim();
  const name = searchParams.get("name")?.trim();
  const navigate = useNavigate();
  tools.navigate = useNavigate();

  // searchParams.delete("phone");
  // navigate(`/}`, { replace: true });
  //* localization
  const { t } = useTranslation();
  tools.t = t;
  let locale = i18n.language === "en" ? "en" : "ar";
  tools.locale = i18n.language === "en" ? "en" : "ar";

  //* api callbacks
  useLayoutEffect(() => {
    //& if (allCategoriesBillersServices === null) => [allCategoriesBillersServices | userInfo | historyOrders] are all === null
    if (allCategoriesBillersServices === null) {
      getAllCategoriesBillersServices().then((res) => {
        dispatch(allCategoriesBillersServicesActions.update(res));
        setLoaded(true); // show list now
        //& get user info after allCategoriesBillersServices is in redux as needed internally to get user info
        getUserInfo(phone).then((res) => {
          dispatch(
            userInfoActions.update({
              ...res,
              quick_pay: quickPayEnhancer(res.quick_pay), // enhance each quick pay service with more details from allCategoriesBillersServices matching service
            })
          );
          //& get history after user info is in redux as needed internally to get history
          getUserHistory().then((res) => {
            dispatch(historyOrdersActions.update(res.orders));
          });
        });
      });
    } else {
      setLoaded(true);
    }
  }, []);

  useLayoutEffect(() => {
    // to make a state for locale
    searchParams.get("lang") === "en"
      ? i18n.changeLanguage("en")
      : i18n.changeLanguage("ar");
  }, []);
  useEffect(() => {
    // reset currentBiller
    dispatch(currentBillerActions.update(null));
  }, []);
  return (
    <div dir={t("layout.dir")} className="payment-service">
      <div className="container">
        <Menu />
        <div className="categories-billers">
          {loaded ? (
            allCategoriesBillersServices.map((category, catIndex) => (
              <div key={category.id} className="category-billers">
                <h5 className={t("layout.textAlign")}>
                  {locale === "en" ? category.name.en : category.name.ar}
                </h5>
                <div className="billers">
                  {category.billers.map((biller) => (
                    <Card type="biller" item={biller} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </div>
  );
}
