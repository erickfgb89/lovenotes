import { DynamoDB, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, email, validation, name } = req.body;

  // Validate required fields
  if (!username || !password || !email || !validation || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Check the validation answer
  if (validation.toLowerCase() !== 'eve') {
    return res.status(400).json({ message: 'Incorrect validation answer' });
  }

  const id = username.toLowerCase();
  
  try {
    const client = new DynamoDB({
      region: "us-west-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
      }
    });

    // Check if username already exists
    const existingUser = await client.send(
      new GetItemCommand({
        TableName: 'users',
        Key: { id: { S: id } }
      })
    );

    if (existingUser.Item) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create new user
    await client.send(
      new PutItemCommand({
        TableName: 'users',
        Item: {
          id: { S: id },
          name: { S: name },
          password: { S: hashedPassword },
          email: { S: email.toLowerCase() },
          clearedNotes: { L: [] },
          role: { S: 'user' }
        }
      })
    );

    return res.status(201).json({ 
      message: 'User created successfully',
      user: {
        username: id,
        name,
        email: email.toLowerCase(),
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
