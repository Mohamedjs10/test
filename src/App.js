import React, { Suspense } from "react";
import { createContext, useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./Redux/store";
import "./App.css";
import Footer from "./components/Footer";
import FontPerLang from "./components/FontPerLang";
import Loader from "./components/Loader";
import i18n from "./locals/i18n";

const HomePage = React.lazy(() => import("./pages/HomePage"));
const Services = React.lazy(() => import("./pages/Services"));
const AmanForm = React.lazy(() => import("./pages/AmanForm"));
const AmanEnquiry = React.lazy(() => import("./pages/AmanEnquiry"));
const KhalesForm = React.lazy(() => import("./pages/KhalesForm"));
const KhalesEnquiry = React.lazy(() => import("./pages/KhalesEnquiry"));
const ContactForm = React.lazy(() => import("./pages/ContactForm"));
const ContactEnquiry = React.lazy(() => import("./pages/ContactEnquiry"));
const CowPayPayment = React.lazy(() => import("./pages/CowPayPayment"));
const History = React.lazy(() => import("./pages/History"));
const AmanReorderFormAndEnquiry = React.lazy(() =>
  import("./pages/AmanReorderFormAndEnquiry")
);
const KhalesReorderFormAndEnquiry = React.lazy(() =>
  import("./pages/KhalesReorderFormAndEnquiry")
);
const QuickPay = React.lazy(() => import("./pages/QuickPay"));
const QuickPayAdd = React.lazy(() => import("./pages/QuickPayAdd"));

function App() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <FontPerLang>
          <div className="App">
            <div className="App-container">
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/aman-form" element={<AmanForm />} />
                  <Route path="/aman-enquiry" element={<AmanEnquiry />} />
                  <Route path="/khales-form" element={<KhalesForm />} />
                  <Route path="/khales-enquiry" element={<KhalesEnquiry />} />
                  <Route path="/contact-form" element={<ContactForm />} />
                  <Route path="/contact-enquiry" element={<ContactEnquiry />} />
                  <Route path="/cow-pay-payment" element={<CowPayPayment />} />
                  <Route path="/client-history" element={<History />} />
                  <Route
                    path="/aman-reorder"
                    element={<AmanReorderFormAndEnquiry />}
                  />
                  <Route
                    path="/khales-reorder"
                    element={<KhalesReorderFormAndEnquiry />}
                  />
                  <Route path="/quick-pay" element={<QuickPay />} />
                  <Route path="/quick-pay-add" element={<QuickPayAdd />} />
                </Routes>
              </Suspense>
              <Footer />
            </div>
          </div>
        </FontPerLang>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
