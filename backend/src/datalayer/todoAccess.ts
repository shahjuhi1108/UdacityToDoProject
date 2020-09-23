import * as AWS  from 'aws-sdk'

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



}