import {DynamoDB, UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export default async function handler(req, res) {
  console.log('test');
  if(req.method != 'POST') {
    res.status(404).end();
    return;
  }
  if(!req.body.indexKey) {
    res.status(400).end();
    return;
  }

  const client = new DynamoDB({
    region: 'us-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });
  try {
    const result = await client.send(
      new UpdateItemCommand( {
        TableName: 'lovenotes',
        Key: { id: { S: req.body.indexKey } },
        UpdateExpression: 'SET cipherKey=:k',
        ExpressionAttributeValues: { ':k': { "S": req.body.cipherKey } }
      })
    );

    console.log(result);
    res.status(result.$metadata.httpStatusCode).end();
  } catch(error) {
    console.log(error);
    res.status(500).end();
  } finally {
  }
}
