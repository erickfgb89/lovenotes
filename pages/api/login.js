import { DynamoDB, GetItemCommand } from "@aws-sdk/client-dynamodb";
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Hash the provided password for comparison
  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  const client = new DynamoDB({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });

  try {
    // Get user by ID (username)
    const result = await client.send(
      new GetItemCommand({
        TableName: 'users',
        Key: {
          id: { S: username.toLowerCase() }
        }
      })
    );

    // Check if user exists and password matches
    if (result.Item) {
      const user = result.Item;
      
      if (user.password.S === hashedPassword) {
        // Here you would typically:
        // 1. Generate a session token
        // 2. Set cookies/headers
        // 3. Store session in database
        
        // For now, just return success with user data (excluding password)
        const { password, ...userData } = user;
        return res.status(200).json({ 
          message: 'Login successful',
          user: {
            username: userData.id.S,
            name: userData.name.S,
            email: userData.email.S,
            clearedNotes: userData.clearedNotes.L || [],
            role: userData.role?.S || 'user'  
          }
        });
      }
    }

    // If we get here, either user doesn't exist or password is wrong
    // Don't specify which for security
    res.status(401).json({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
}
