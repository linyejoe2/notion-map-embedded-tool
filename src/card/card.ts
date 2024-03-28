import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
const dynamoDB = new DynamoDB.DocumentClient();

export type TCardData = {
  question: string,
  additional: string,
  answar: string,
  description: string
}

export async function addCard(cardData: TCardData): Promise<string> {
  try {
    const cardId = uuidv4();
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: 'flash_card',
      Item: {
        card_id: cardId,
        ...cardData
      }
    }
    console.log(JSON.stringify(params))
    await dynamoDB.put(params).promise();
    return cardId;
  } catch (e) {
    // 包装错误信息成自定义错误对象
    console.log(JSON.stringify(e));
    const customError = new Error(e.message);
    throw customError; // 抛出自定义错误对象
  }
}