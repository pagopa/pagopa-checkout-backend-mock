import { RequestHandler } from "express";
import { logger } from "../logger";
import { FeatureFlagsResponse } from "../generated/checkout-feature-flags/FeatureFlagsResponse";

export const checkoutFeatureFlag: RequestHandler = async (req, res) => {
  logger.info("[Get Feature flag] - Return checkout feature flags");
  const loginResponse: FeatureFlagsResponse = {
    isAuthenticationEnabled: true
  };
  res.status(200).send(loginResponse);
};
