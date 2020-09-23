import * as AWS  from 'aws-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoDelete } from '../models/TodoDelete'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class TodoAccess {
    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly bucketName = process.env.TODO_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)) {
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

  async deleteTodo(item: TodoDelete): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoTable,
        Key:{
            'userId':item.userId,
            'todoId':item.todoId
        }
    }).promise()
  }

  async getPresignedUrl(todoId: string){
    return s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: this.urlExpiration
      });
  }
}