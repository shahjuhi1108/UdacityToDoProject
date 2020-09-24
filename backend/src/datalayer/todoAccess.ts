import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoDelete } from '../models/TodoDelete'
import { createLogger } from '../utils/logger'


const logger = createLogger('todos')

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class TodoAccess {
    constructor(
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly bucketName = process.env.TODO_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)) {
    }

    async getTodosPerUser(userId: string) {
      logger.info(`get todos for user ${userId}`)
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
    logger.info(`create todo for user ${item.userId} with data ${item}`)
    await this.docClient.put({
        TableName: this.todoTable,
        Item: item
      })
      .promise()
  
    return item
  }

  async updateTodo(item: TodoUpdate): Promise<void> {

    logger.info(`User ${item.userId} updating todo ${item.todoId} to be ${item}`)

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
    logger.info(`User ${item.userId} deleting todo ${item.todoId}`)
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