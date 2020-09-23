import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  console.log("Processing create to do event.", event)

  const userId = getUserId(event)
  console.log(userId)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log(JSON.stringify(todoId))
  console.log(JSON.stringify(updatedTodo))

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  // const item = await getTodoById(todoId)

  // console.log(JSON.stringify(item))

  const newItem = await updateTodo(updatedTodo, userId, todoId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      newItem
    })
  }
}

// async function getTodoById(todoId: string): Promise<AWS.DynamoDB.QueryOutput>{
//   return await docClient.query({
//       TableName: todoTable,
//       KeyConditionExpression: 'todoId = :todoId',
//       ExpressionAttributeValues:{
//           ':todoId': todoId
//       }
//   }).promise()
// }

async function updateTodo(updatedTodo:UpdateTodoRequest,userId:string,todoId:string){
  await docClient.update({
      TableName: todoTable,
      Key:{
          'userId':userId,
          'todoId':todoId
      },
      UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
      ExpressionAttributeValues: {
          ':n' : updatedTodo.name,
          ':d' : updatedTodo.dueDate,
          ':done' : updatedTodo.done
      },
      ExpressionAttributeNames:{
          "#namefield": "name"
        }
    }).promise()
}