import { TodoAccess } from '../datalayer/todoAccess'
import { APIGatewayProxyEvent } from 'aws-lambda'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'

const todoAccess = new TodoAccess()
const bucketName = process.env.TODO_S3_BUCKET

export async function getTodosPerUser(userId: string): Promise<any> {
    return todoAccess.getTodosPerUser(userId)
}

export async function createTodo(event:APIGatewayProxyEvent, newTodo: CreateTodoRequest): Promise<TodoItem> {
    const timestamp = new Date().toISOString()
    const userId = getUserId(event)
    const todoId = uuid.v4()
  
    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        createdAt: timestamp,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
}