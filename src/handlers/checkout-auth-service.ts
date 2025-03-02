/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import { LoginResponse } from "../generated/checkout-auth-service-v1/LoginResponse";
import { logger } from "../logger";
import { AuthResponse } from "../generated/checkout-auth-service-v1/AuthResponse";
import { AuthRequest } from "../generated/checkout-auth-service-v1/AuthRequest";
import { ProblemJson } from "../generated/checkout-auth-service-v1/ProblemJson";
import { FlowCase, getFlowCookie } from "../flow";

export const checkoutAuthServiceLogin: RequestHandler = async (_req, res) => {
  logger.info("[Get Auth Login] - Return success");
  const loginResponse: LoginResponse = {
    urlRedirect:
      "http://localhost:1234/auth-callback?code=J0NYD7UqPejqXpl6Fdv8&state=1BWuOGF4L3CTroTEvUVF"
  };
  res.status(200).send(loginResponse);
};

export const checkoutAuthServicePostToken = (req: any, res: any): void => {
  const body: AuthRequest = req.body;
  if (!body.authCode || !body.state) {
    logger.info("[Post Auth Token] - Error Missing authCode or state");
    const response: ProblemJson = {
      title: "AuthCode or state is missing"
    };
    res.status(500).send(response);
    return;
  }

  logger.info("[Post Auth Token] - Return success");
  const loginResponse: AuthResponse = {
    authToken: "B2T4HeCx7wTvBRABSZ36"
  };
  res.status(200).send(loginResponse);
};
const checkoutAuthServicePostToken500 = (res: any): void => {
  const response: ProblemJson = {
    title: "AuthCode or state is missing"
  };
  res.status(500).send(response);
};

export const checkoutAuthServicePostTokenHandler: RequestHandler = async (
  req,
  res
) => {
  logger.info("[User auth post token]");
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (getFlowCookie(req)) {
    case FlowCase.FAIL_POST_AUTH_TOKEN:
      logger.info("[User auth post token] - Return error case 500");
      checkoutAuthServicePostToken500(res);
      break;
    default:
      logger.info("[User auth post token] - Return success case 200 OK");
      checkoutAuthServicePostToken(req, res);
  }
};
