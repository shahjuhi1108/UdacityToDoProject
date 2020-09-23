import * as AWS  from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {
    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE) {
    }

    async getTodosPerUser(userId: string) {
        const result = await this.docClient.query({
          TableName: this.todoTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
          ScanIndexForward: false
        }).promise()
      
        return result.Items
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todoTable,
        Item: item
      })
      .promise()
  
    return item
  }

  async updateTodo(item: TodoUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key:{
          'userId':item.userId,
          'todoId':item.todoId
      },
      UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
      ExpressionAttributeValues: {
          ':n' : item.name,
          ':d' : item.dueDate,
          ':done' : item.done
      },
      ExpressionAttributeNames:{
          "#namefield": "name"
        }
    }).promise()
  }

}