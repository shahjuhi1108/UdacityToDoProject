import * as AWS  from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'

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

}