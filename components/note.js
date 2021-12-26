import { useState } from 'react';
import { decipher } from '../lib/cipherHelpers.js';
import styles from '../styles/Home.module.css';


function getActiveKey(ssp) {
  let key = null;
  if(ssp.query.key)
    key = ssp.query.key;
  else if(ssp.note.hasOwnProperty('cipherKey'))
    key = ssp.note.cipherKey.S;
  else
    key = '';

  return key;
};

export default function Note({ssp}) {
  const [activeKey, setActiveKey] = useState(getActiveKey(ssp));
  const [plain, setPlain] = useState(decipher(ssp.note.text.S, getActiveKey(ssp)));
  const [saveStatus, setSaveStatus] = useState(null);

  const updateKey = (e) => {
    if(e.type != 'input') return;
    let newKey = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setActiveKey(newKey);
    setPlain(decipher(ssp.note.text.S, newKey));
  };

  const saveKey = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(
        '/api/saveKey', {
          body: JSON.stringify({
            indexKey: ssp.note.id.S,
            cipherKey: activeKey
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      );

      setSaveStatus(resp.status < 300);
    } catch(e) {
      console.log(e);
      setSaveStatus(false);
    }
  };

  const preventSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <h1 className={styles.title}>{ssp.note.title.S}</h1>
      <div className={styles.card} style={{"maxWidth": "80%"}}>
        {plain.split("\n\n").map((p,i) => (
          <>
            <p key={i}>{p}</p>
            <br/>
          </>
        ))}
      </div>
      <footer className={styles.footer}>
        <form onSubmit={preventSubmit}>
          <div className={styles.inputWrap}>
            <label htmlFor="key">Key</label>
            <input id="key" type="text"
                   value={activeKey}
                   onInput={updateKey}/>
          </div>
          <button id='save' className={styles.fadeColors}
                  style={{borderColor: !saveStatus ? null : (saveStatus ? 'green' : 'red')}}
                  onClick={saveKey}>save key</button>
        </form>
      </footer>
    </>
  );
}
