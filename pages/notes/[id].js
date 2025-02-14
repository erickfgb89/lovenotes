import Link from 'next/link';
import {DynamoDB, GetItemCommand} from "@aws-sdk/client-dynamodb";
import Note from '../../components/note.js';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';

export default function notePage({ note, query }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{note.title}</title>
      </Head>
      <Link href="/">
        ← go back
      </Link>
      <main className={styles.main}>
        <Note note={note} activeKey={query.key || ''} />
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const client = new DynamoDB({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });
  
  try {
    const results = await client.send(
      new GetItemCommand({
        TableName: 'lovenotes',
        Key: {id: {S: context.query.id}}
      })
    );
    
    if (!results.Item) {
      return {
        notFound: true
      };
    }

    const noteCleared = JSON.parse(context.req.cookies.clearedNotes || '[]').includes(context.query.id);

    const note = {
      id: results.Item.id.S,
      title: results.Item.title.S,
      text: results.Item.text.S,
      cipherKey: noteCleared ? (results.Item.cipherKey?.S || '') : '',
      cipherKeySHA256: results.Item.cipherKeySHA256.S
    };

    return {
      props: {
        query: context.query,
        note
      }
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        query: context.query,
        note: null
      }
    };
  }
}
