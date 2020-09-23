import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE
const bucketName = process.env.TODO_S3_BUCKET


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  console.log("Processing create to do event.", event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  
  const userId = getUserId(event)

  console.log(userId)

  const todoId = uuid.v4()
  const item = await createTodo(userId, todoId, newTodo)

  console.log(JSON.stringify(item))

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      item
    })
  }
}


async function createTodo(userId: string, todoId: string, newTodo: any) {
  const timestamp = new Date().toISOString()
  console.log(userId)
  const item = {
    userId,
    todoId,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    createdAt: timestamp,
    done: false,
    ...newTodo
  }
  console.log('Storing new item: ', item)

  await docClient
    .put({
      TableName: todoTable,
      Item: item
    })
    .promise()

  return item
}