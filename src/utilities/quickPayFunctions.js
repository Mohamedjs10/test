import { store, quickPayActions } from "../Redux/store";
import { addToQuickPay, deleteFromQuickPay, fetchEnquiry } from "./apiCalls";
// // ----------------------------------------------------------------
const redux = (slice) => {
  // to get updated slice
  return store.getState()[slice].value;
};
// // ----------------------------------------------------------------
// export const servicePageRoute = (channelId) => {
//   switch (channelId) {
//     case 2:
//       return "/aman-form";
//     case 4:
//       return "/khales-form";
//     case 1:
//       return "/contact-form";
//     default:
//   }
// };

export const dispatchCheckedPostpaidEnquiriesTotalAmount = () => {
  // rewrite using map to be more clear
  let sum = redux("quickPay").multiPay.checkedPostpaidServicesEnquiries?.reduce(
    (accumulator, object) => {
      return (
        accumulator +
        (object.provider_name === "khales"
          ? +object?.overallPayment
          : +object?.totalAmount)
      );
    },
    0
  );

  store.dispatch(
    quickPayActions.update({
      type: "checkedPostpaidServicesEnquiriesTotalAmount",
      value: sum,
    })
  );
};

export const quickPayEnhancer = (quickPay) => {
  let detailedQuickPay = [];
  quickPay.map((qpService) => {
    // todo
    redux("allCategoriesBillersServices").map((category) => {
      category.billers.map((biller) => {
        biller.biller_services.map((service) => {
          if (service.code === qpService.service_code) {
            detailedQuickPay.push({
              ...service,
              ...qpService, // let what I enhance override any similar key in supporter
              biller_image: biller.image_url,
              biller_name: biller.name,
            });
            // todo: skip to next qpService, ignore iterating over the remaining categories, billers and services
          }
        });
      });
    });
  });

  return detailedQuickPay;
};
