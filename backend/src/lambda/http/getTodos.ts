import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
//import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { getTodosPerUser } from '../../businessLogic/todos'

// const docClient = new AWS.DynamoDB.DocumentClient()
//const todoTable = process.env.TODO_TABLE
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing get todo event: ', event)

  const userId = getUserId(event)

  logger.info(`get groups for user ${userId}`)

  const todos = await getTodosPerUser(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
}

// async function getTodosPerUser(userId: string) {
//   const result = await docClient.query({
//     TableName: todoTable,
//     KeyConditionExpression: 'userId = :userId',
//     ExpressionAttributeValues: {
//       ':userId': userId,
//     },
//     ScanIndexForward: false
//   }).promise()

//   return result.Items
// }