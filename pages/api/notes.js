import { DynamoDB, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, title, text, cipherKey, cipherKeySHA256 } = req.body;

  // Validate required fields
  if (!id || !title || !text || !cipherKey || !cipherKeySHA256) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate id format (url-safe)
  if (!/^[a-z0-9-]+$/.test(id)) {
    return res.status(400).json({ message: 'Invalid ID format - use only lowercase letters, numbers, and hyphens' });
  }

  const client = new DynamoDB({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });

  try {
    // Check if ID already exists
    const existingNote = await client.send(
      new GetItemCommand({
        TableName: 'lovenotes',
        Key: { id: { S: id } }
      })
    );

    if (existingNote.Item) {
      return res.status(400).json({ message: 'A note with this ID already exists' });
    }

    // Create new note
    await client.send(
      new PutItemCommand({
        TableName: 'lovenotes',
        Item: {
          id: { S: id },
          title: { S: title },
          text: { S: text },
          cipherKey: { S: cipherKey },
          cipherKeySHA256: { S: cipherKeySHA256 }
        }
      })
    );

    return res.status(201).json({ 
      message: 'Note created successfully',
      id
    });

  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}