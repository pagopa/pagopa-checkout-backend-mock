/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatusCode, ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { AmountEuroCents } from "../../generated/ecommerce/AmountEuroCents";
import { ClientIdEnum } from "../../generated/ecommerce/NewTransactionResponse";
import { RptId } from "../../generated/ecommerce/RptId";
import { TransactionStatusEnum } from "../../generated/ecommerce/TransactionStatus";
import {
  TransactionInfo,
  TransactionInfoGatewayInfo,
  TransactionInfoNodeInfo
} from "../../generated/ecommerce-v2/TransactionInfo";

export const createSuccessGetTransactionEntity = (
  transactionId: string,
  status: TransactionStatusEnum,
  errorCode?: string,
  nodeInfo?: TransactionInfoNodeInfo,
  gatewayInfo?: TransactionInfoGatewayInfo
): TransactionInfo => ({
  authToken:
    "eyJhbGciOiJIUzUxMiJ9.eyJ0cmFuc2FjdGlvbklkIjoiMTdhYzhkZTMtMjAzMy00YzQ2LWI1MzQtZjE5MTk2NmNlODRjIiwicnB0SWQiOiI3Nzc3Nzc3Nzc3NzMzMDIwMDAwMDAwMDAwMDAwMCIsImVtYWlsIjoibmFtZS5zdXJuYW1lQHBhZ29wYS5pdCIsInBheW1lbnRUb2tlbiI6IjRkNTAwZTk5MDg3MTQyMDJiNTU3NTFlZDZiMWRmZGYzIiwianRpIjoiODUxNjQ2NDQzMjUxMTQxIn0.Fl3PoDBgtEhDSMFR3unkAow8JAe2ztYDoxlu7h-q_ygmmGvO7zP5dlztELUQCofcmYwhB4L9EgSLNT-HbiJgKA",
  clientId: ClientIdEnum.CHECKOUT,
  errorCode,
  feeTotal: 99999999,
  gatewayInfo,
  nodeInfo,
  payments: [
    {
      amount: 1000 as AmountEuroCents,
      isAllCCP: false,
      paymentToken: "paymentToken1",
      reason: "reason1",
      rptId: "77777777777302012387654312384" as RptId,
      transferList: [
        {
          digitalStamp: true,
          paFiscalCode: "66666666666",
          transferAmount: 100 as AmountEuroCents,
          transferCategory: "transferCategory1"
        },
        {
          digitalStamp: false,
          paFiscalCode: "77777777777",
          transferAmount: 900 as AmountEuroCents,
          transferCategory: "transferCategory2"
        }
      ]
    }
  ],
  status,
  transactionId
});

export const error404TransactionIdNotFound = (
  transactionId: string
): ProblemJson => ({
  detail: "Transaction with id: " + transactionId + " not found",
  instance: "Example instance",
  status: 404 as HttpStatusCode,
  title: "Transaction not found"
});

export const internalServerError500 = (): ProblemJson => ({
  detail: "Internal server error",
  instance: "Example instance",
  status: 500 as HttpStatusCode,
  title: "Internal server error"
});
