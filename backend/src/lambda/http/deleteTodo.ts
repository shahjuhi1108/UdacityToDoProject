import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  console.log("Processing create to do event.", event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  await deleteTodoById(userId, todoId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: ""
  }
  // TODO: Remove a TODO item by id
}

async function deleteTodoById(userId:string,todoId: string){
  const param = {
      TableName: todoTable,
      Key:{
          "userId":userId,
          "todoId":todoId
      }
  }

   await docClient.delete(param).promise()
}
