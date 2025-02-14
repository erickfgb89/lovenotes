import {DynamoDB, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import { serialize } from 'cookie';

export default async function handler(req, res) {
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

    // Get current clearedNotes from cookies or initialize empty array
    const currentClearedNotes = JSON.parse(req.cookies.clearedNotes || '[]');
    
    // Add the new note ID if not already present
    if (!currentClearedNotes.includes(req.body.indexKey)) {
      currentClearedNotes.push(req.body.indexKey);
    }

    // Set the updated clearedNotes cookie
    res.setHeader('Set-Cookie', serialize('clearedNotes', JSON.stringify(currentClearedNotes), {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    }));

    res.status(result.$metadata.httpStatusCode).end();
  } catch(error) {
    console.log(error);
    res.status(500).end();
  }
}
