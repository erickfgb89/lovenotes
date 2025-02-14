import { DynamoDB, UpdateItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = new DynamoDB({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });

  try {
    // First, verify the current password
    const user = await client.send(
      new GetItemCommand({
        TableName: 'users',
        Key: { id: { S: username.toLowerCase() } }
      })
    );

    if (!user.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.Item.password.S !== currentPassword) {
      // TODO restore
      //return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update the password
    await client.send(
      new UpdateItemCommand({
        TableName: 'users',
        Key: { id: { S: username.toLowerCase() } },
        UpdateExpression: 'SET password = :newPassword',
        ExpressionAttributeValues: {
          ':newPassword': { S: newPassword }
        }
      })
    );

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
