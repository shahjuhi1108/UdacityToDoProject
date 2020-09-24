import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('auth')

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new XAWS.SecretsManager()

let cachedSecret: string

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-91t2tt75.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  console.log(JSON.stringify(event))
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    //console.log(jwtToken.sub)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

    const token = getToken(authHeader)
    // const jwt: Jwt = decode(token, { complete: true }) as Jwt
    // console.log('jwt', jwt.payload)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

    const secretObject: any = await getSecret()
    const secret = secretObject[secretField]

    console.log(JSON.stringify(secret))

    return verify(token, secret) as JwtPayload
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return token
  }

async function getSecret() {
    if (cachedSecret) return cachedSecret

    const data = await client
    .getSecretValue({
        SecretId: secretId
    })
    .promise()

    cachedSecret = data.SecretString

    return JSON.parse(cachedSecret)
}
