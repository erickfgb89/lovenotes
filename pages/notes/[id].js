import {DynamoDB, GetItemCommand} from "@aws-sdk/client-dynamodb";
import { useRouter } from 'next/router';
import Note from '../../components/note.js';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';

export async function getServerSideProps(context) {
  // return {props: {
  //   query: context.query,
  //   //query: {key: 'SASIORJOIU'},
  //   note: {
  //   text: {
  //     S: "OE POMN OLWAL YZMG, S YZSRC UUJRAIUV, I YRWIH QCCMW. JIK BWNZIFO ZB XYJFWKH, OVX YGC XDWLY UK HF SDYJ YZSRCSZ ZEAOVKB, CFSHZWEP CM TG HFF WOJ YZCNRBO DINMG FWBB YGC. NJMLQ LQAV W FGOC PRLY UL DQTV, QN SWMAJ W'PW UTWDKSL WVWZSJC IFD GDSI OOUAN AWELS NZE TOJC BCEE Q CXCSYV, IBU WB'K STZ CVIHCS BC HCCL DWAWIN BI ADEOPB JY BWBHVA."
  //   },
  //   id: { S: '20211225-0' },
  //   key: { S: '' },
  //   title: { S: 'Good enough is never good enough' }
  //   }}};
  //return {props: {text: { S: 'aoeu'}}};

  const client = new DynamoDB({
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_LOVENOTES,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_LOVENOTES
    }
  });
  const props = { props: {
    query: context.query,
    note: {},
  } };
  try {
    // const results = await client.getItem({
    //   TableName: 'lovenotes',
    //   Key: {id: {S: context.query.id}}
    // });
    const results = await client.send(
      new GetItemCommand({
        TableName: 'lovenotes',
        Key: {id: {S: context.query.id}}
      })
    );
    //console.log(results);
    console.log(results.Item);
    props.props.note = results.Item;
  } catch (err) {
    console.error(err);
  } finally {
    return props;
  }
}

export default function notePage(ssp) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{ssp.note.title.S}</title>
      </Head>
      <main className={styles.main}>
        <Note Text={ssp.note.text.S} Key={ssp.query.key} ssp={ssp}/>
      </main>
    </div>
  );
}
