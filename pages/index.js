import {DynamoDB, ScanCommand} from "@aws-sdk/client-dynamodb";
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { decipher } from '../lib/cipherHelpers.js';

export async function getServerSideProps(context) {
  let props = { props: {} };
  try {
    const client = new DynamoDB({
      region: 'us-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
      }
    });
    const results = await client.send(
      new ScanCommand({
        TableName: 'lovenotes',
      })
    );
    props.props.items = results.Items.map(
      (note,idx) => {
        if(!note.hasOwnProperty('cipherKey')) {
          note.cipherKey = {S: ''};
        }
        note.text.S = note.text.S.substring(0, 50) + '...';
        return note;
      }
    );
  } catch(e) {
    // do error handling stuff here later
    console.log(e);
  } finally {
    return props;
  }
}

export default function Home(ssp) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Notes for My Dream Girl</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Love Notes for My Wonderful Wife
        </h1>

        <p className={styles.description}>
          Find tags to unlock notes!<br/>
          Or, sit around and guess... your choice
        </p>

        <div className={styles.grid}>
          {ssp.items.map( (note, idx) => (
            <a key={note.id.S} href={`notes/${note.id.S}`} className={styles.card}>
              <h2>{note.title.S}</h2>
              <p>{decipher(note.text.S, note.cipherKey.S)}</p>
            </a>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Sometimes we fight over dumb things, and I wish there was a piece
          of me still capable of telling you all the things I love about
          you when I'm too stubborn to say them myself.
        </p>
        <p>
          Most of the time, I just want you to see you the way I see you,
          and I want to remember these moments as individual memories
          fade into the beautiful glow of a life well loved.
        </p>
      </footer>
    </div>
  );
}

function newHome() {
  (async () => {
    const client = new DynamoDB({ region: "us-west-2" });
    try {
      const results = await client.send(
        new GetItemCommand({
          TableName: 'lovenotes',
          Key: {id: {S: '20211225-0'}}
        })
      );
      console.log(results.Item);
    } catch (err) {
      console.error(err);
    }
  })();
  return (
    <main>
      <h1>test</h1>
    </main>
  );
}
