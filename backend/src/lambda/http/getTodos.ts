import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('Processing get todo event: ', event)

  const userId = getUserId(event)
  const validUserId = await userExists(userId)

  console.log(userId)

  if (!validUserId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'User does not exist'
      })
    }
  }

  const todos = await getTodosPerUser(userId)

  // const result = await docClient.get({
  //   TableName: todoTable,
  //   Key: {
  //     id: userId
  //   }
  // }).promise()

  // const items = result.Item

  // console.log(items)

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


async function userExists(userId: string) {
  console.log(userId)

  // const result = await docClient
  //   .get({
  //     TableName: todoTable,
  //     Key: {
  //       id: userId
  //     }
  //   })
  //   .promise()

  // console.log('Get user: ', result)
  // return !!result.Item
  return true
}

async function getTodosPerUser(userId: string) {
  console.log(userId)
  console.log(todoTable)

  const result = await docClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}