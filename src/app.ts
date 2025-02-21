/* eslint-disable extra-rules/no-commented-out-code */
/* eslint-disable sort-keys */
import * as express from "express";
import { toExpressHandler } from "@pagopa/ts-commons/lib/express";
import * as cookieParser from "cookie-parser";
// import { createProxyMiddleware } from "http-proxy-middleware";
// import {
//   activatePaymentHandler,
//   cancelPayment,
//   checkPaymentStatusHandler,
//   getPaymentInfoHandler,
//   pay3ds2Handler,
//   paymentCheckHandler
// } from "./handlers/payments";
import { approveTermsHandler, startSessionHandler } from "./handlers/users";
import { addWalletHandler, updateWalletHandler } from "./handlers/wallet";
import {
  checkTransactionHandler,
  resume3ds2Handler
} from "./handlers/transactions";
import { getPspListHandler } from "./handlers/psps";
import { ID_PAYMENT, SESSION_USER } from "./constants";
import { ecommerceActivation } from "./handlers/ecommerce/activation";
import {
  ecommerceDeleteTransaction,
  ecommerceGetTransaction
} from "./handlers/ecommerce/transaction";
import { ecommerceVerify } from "./handlers/ecommerce/verify";
import {
  ecommerceGetPspByPaymentMethodsV1,
  ecommerceGetPspByPaymentMethodsV2
} from "./handlers/ecommerce/psp";
import { ecommerceGetCart } from "./handlers/ecommerce/cart";
import { ecommerceAuthRequest } from "./handlers/ecommerce/auth-request";
import {
  createFormWithNpg,
  ecommerceGetPaymentMethods,
  retrieveCardDataFromNpg
} from "./handlers/ecommerce/payment-method";
import { checkoutAuthServiceLogin } from "./handlers/checkout-auth-service";
import { checkoutFeatureFlag } from "./handlers/checkout-feature-flags";

// eslint-disable-next-line max-lines-per-function
export const newExpressApp: () => Promise<Express.Application> = async () => {
  const app = express();
  const router = express.Router();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    ["/checkout/payments/*", "/checkout/payment-transactions/*"],
    async (req, res: express.Response, next) => {
      const oldJson = res.json;

      // eslint-disable-next-line functional/immutable-data
      res.json = (
        body: Record<string, unknown>
      ): express.Response<Record<string, unknown>> => {
        try {
          const originalResponseBody = body;

          if (
            [404, 409, 502, 503, 504].includes(res.statusCode) &&
            originalResponseBody.detail_v2 !== null
          ) {
            res.status(400);

            const response = {
              detail: originalResponseBody.detail_v2,
              status: 400,
              title: originalResponseBody.title
            };

            return oldJson.call(res, response);
          } else {
            return oldJson.call(res, originalResponseBody);
          }
        } catch (e) {
          return oldJson.call(res, body);
        }
      };
      next();
    }
  );

  app.use((req, res, next) => {
    setTimeout(next, Number(process.env.ENDPOINT_DELAY));
  });

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Authorization, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ]);
    next();
  });

  app.get("/getPaymentId", async (_req, res) => {
    res.status(200).send({
      idPayment: ID_PAYMENT
    });
  });

  app.use(router);

  // router.get(
  //   "/pp-restapi/v4/payments/:id/actions/check",
  // eslint-disable-next-line extra-rules/no-commented-out-code
  //   paymentCheckHandler(ID_PAYMENT, USER_DATA)
  // );

  router.post(
    "/pp-restapi/v4/users/actions/start-session",
    toExpressHandler(startSessionHandler(ID_PAYMENT, SESSION_USER))
  );

  router.post(
    "/pp-restapi/v4/users/actions/approve-terms",
    toExpressHandler(approveTermsHandler(SESSION_USER))
  );

  router.post("/pp-restapi/v4/wallet", toExpressHandler(addWalletHandler()));

  // router.post(
  //   "/pp-restapi/v4/payments/:id/actions/pay3ds2",
  // eslint-disable-next-line extra-rules/no-commented-out-code
  //   toExpressHandler(pay3ds2Handler(USER_DATA))
  // );

  router.get(
    "/pp-restapi/v4/transactions/:id/actions/check",
    toExpressHandler(checkTransactionHandler(ID_PAYMENT))
  );

  // router.delete("/pp-restapi/v4/payments/:id/actions/delete", cancelPayment);

  router.post(
    "/pp-restapi/v4/transactions/:transactionData/actions/resume3ds2",
    resume3ds2Handler
  );

  router.get("/pp-restapi/v4/psps", getPspListHandler);

  router.put("/pp-restapi/v4/wallet/:id", updateWalletHandler);

  app.get(
    "/checkout/payment-transactions/v1/browsers/current/info",
    async (_req, res) => {
      res.send({
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        ip: "127.0.0.1",
        useragent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36"
      });
    }
  );

  // payment-requests-service get cart requests mock
  app.get("/ecommerce/checkout/v1/payment-requests/:rptId", ecommerceVerify);

  // payment-requests-service get cart requests mock
  app.get("/ecommerce/checkout/v1/carts/:id", ecommerceGetCart);

  // TODO refactoring to handle errors scenario
  app.get("/ecommerce/checkout/v1/payment-methods", ecommerceGetPaymentMethods);

  // payment-methods-service get psp by payment methods V1 requests mock
  app.post(
    "/ecommerce/checkout/v1/payment-methods/:id/fees",
    ecommerceGetPspByPaymentMethodsV1
  );

  // payment-methods-service get psp by payment methods V2 requests mock
  app.post(
    "/ecommerce/checkout/v2/payment-methods/:id/fees",
    ecommerceGetPspByPaymentMethodsV2
  );

  // payment-methods-service preauthorizations npg proxy
  app.post(
    "/ecommerce/checkout/v1/payment-methods/:id/sessions",
    createFormWithNpg
  );

  // payment-methods-service session payment method npg proxy
  app.get(
    "/ecommerce/checkout/v1/payment-methods/:id/sessions/:orderId",
    retrieveCardDataFromNpg
  );

  // transaction-service new transaction request mock
  // v1 is deprecated
  /* app.get(
    "/ecommerce/checkout/v1/transactions/:transactionId",
    ecommerceGetTransaction
  ); */

  // transaction-service new transaction request mock
  app.get(
    "/ecommerce/checkout/v2/transactions/:transactionId",
    ecommerceGetTransaction
  );

  // transaction-service new transaction request mock
  app.post("/ecommerce/checkout/v1/transactions", ecommerceActivation);

  // transaction-service v2 new transaction request mock
  app.post("/ecommerce/checkout/v2/transactions", ecommerceActivation);

  // transaction-service transaction user cancel
  app.delete(
    "/ecommerce/checkout/v1/transactions/:transactionId",
    ecommerceDeleteTransaction
  );

  // transaction-service auth-request mock
  app.post(
    "/ecommerce/checkout/v1/transactions/:transactionId/auth-requests",
    ecommerceAuthRequest
  );

  // checkout-auth-service login mock
  app.get("/checkout/auth-service/v1/auth/login", checkoutAuthServiceLogin);

  // checkout feature flags mock
  app.get("/checkout/feature-flags/v1/features/values", checkoutFeatureFlag);

  return app;
};
