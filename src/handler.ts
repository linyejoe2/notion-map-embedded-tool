import type {
  APIGatewayProxyHandler
} from "aws-lambda";
import { APIGateway, DynamoDB } from "aws-sdk";
import * as card from "./card/card";
const dynamoDB = new DynamoDB.DocumentClient();

export const test: APIGatewayProxyHandler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "connection is good!",
      input: event,
      context
    })
  }
}


