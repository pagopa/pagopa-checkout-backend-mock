import * as express from "express";
import { toExpressHandler } from "@pagopa/ts-commons/lib/express";
import * as cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  cancelPayment,
  pay3ds2Handler,
  paymentCheckHandler,
  getPaymentInfoHandler,
  activatePaymentHandler,
  checkPaymentStatusHandler
} from "./handlers/payments";
import { approveTermsHandler, startSessionHandler } from "./handlers/users";
import { addWalletHandler, updateWalletHandler } from "./handlers/wallet";
import {
  checkTransactionHandler,
  resume3ds2Handler
} from "./handlers/transactions";
import { getPspListHandler } from "./handlers/psps";
import { ID_PAYMENT, SESSION_USER, USER_DATA } from "./constants";

export const newExpressApp: () => Promise<Express.Application> = async () => {
  const app = express();
  const router = express.Router();

  app.use(express.json());
  app.use(cookieParser());

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

  router.get(
    "/pp-restapi/v4/payments/:id/actions/check",
    paymentCheckHandler(ID_PAYMENT, USER_DATA)
  );

  router.post(
    "/pp-restapi/v4/users/actions/start-session",
    toExpressHandler(startSessionHandler(ID_PAYMENT, SESSION_USER))
  );

  router.post(
    "/pp-restapi/v4/users/actions/approve-terms",
    toExpressHandler(approveTermsHandler(SESSION_USER))
  );

  router.post("/pp-restapi/v4/wallet", toExpressHandler(addWalletHandler()));

  router.post(
    "/pp-restapi/v4/payments/:id/actions/pay3ds2",
    toExpressHandler(pay3ds2Handler(USER_DATA))
  );

  router.get(
    "/pp-restapi/v4/transactions/:id/actions/check",
    toExpressHandler(checkTransactionHandler(ID_PAYMENT))
  );

  router.delete("/pp-restapi/v4/payments/:id/actions/delete", cancelPayment);

  router.post(
    "/pp-restapi/v4/transactions/:transactionData/actions/resume3ds2",
    resume3ds2Handler
  );

  router.get("/pp-restapi/v4/psps", getPspListHandler);

  router.put("/pp-restapi/v4/wallet/:id", updateWalletHandler);

  app.get(
    "/checkout/payments/v1/payment-requests/:rptId",
    getPaymentInfoHandler(ID_PAYMENT)
  );

  app.post(
    "/checkout/payments/v1/payment-activations",
    toExpressHandler(activatePaymentHandler())
  );

  app.get(
    "/checkout/payments/v1/payment-activations/:codiceContestoPagamento",
    toExpressHandler(checkPaymentStatusHandler(ID_PAYMENT))
  );

  app.use(
    createProxyMiddleware("/checkout/payment-transactions", {
      onProxyReq: (proxyReq, _req, _res) => {
        // eslint-disable-next-line functional/immutable-data
        proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
      },
      pathRewrite: {
        "^/checkout/payment-transactions": "/api"
      },
      target: `http://${process.env.PAGOPA_FUNCTIONS_CHECKOUT_HOST}:${process.env.PAGOPA_FUNCTIONS_CHECKOUT_PORT}`
    })
  );

  return app;
};
