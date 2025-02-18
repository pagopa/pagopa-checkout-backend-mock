import { RequestHandler } from "express";
import { LoginResponse } from "../generated/checkout-auth-service-v1/LoginResponse";
import { logger } from "../logger";

export const checkoutAuthServiceLogin: RequestHandler = async (req, res) => {
  logger.info("[Get Auth Login] - Return success");
  const loginResponse : LoginResponse = {
    urlRedirect: "/auth-callback?code=123456"
  }
  res.status(200).send(loginResponse)
};
