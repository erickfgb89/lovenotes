import { useState } from 'react';
import { decipher } from '../lib/cipherHelpers.js';
import styles from '../styles/Home.module.css';

export default function Note({ note, activeKey: initialKey }) {
  const [activeKey, setActiveKey] = useState(initialKey || note.cipherKey || '');
  const [plain, setPlain] = useState(decipher(note.text, activeKey));
  const [saveStatus, setSaveStatus] = useState(null);
  const [cleared, setCleared] = useState(!!(note.cipherKey || (note.cipherKeySHA256 && crypto.createHash('sha256').update(initialKey).digest('hex') === note.cipherKeySHA256)));

  const updateKey = (e) => {
    if(e.type !== 'input') return;
    let newKey = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setActiveKey(newKey);
    setPlain(decipher(note.text, newKey));
    checkKey();
  };

  const checkKey = () => {
    if( !cleared && note.cipherKeySHA256 && crypto.createHash('sha256').update(activeKey).digest('hex') === note.cipherKeySHA256) {
      setCleared(true);
    }
  }

  const saveKey = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(
        '/api/saveKey', {
          body: JSON.stringify({
            indexKey: note.id,
            cipherKey: activeKey,
            cipherKeySHA256: crypto.createHash('sha256').update(activeKey).digest('hex')
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

  // initial check, in case the correct key was passed by queryparam
  checkKey();

  return (
    <>
      <h1 className={styles.title}>{note.title}</h1>
      <div className={styles.card} style={{"maxWidth": "80%"}}>
        {plain.split("\\n\\n").map((p,i) => (
          <div key={i}>
            <p>{p}</p>
            <br/>
          </div>
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
          { !note.cipherKeySHA256 && <button id='save' className={styles.fadeColors}
                  style={{borderColor: !cleared ? null : (cleared ? 'green' : 'red')}}
                  onClick={saveKey}>save key</button> }
        </form>
      </footer>
    </>
  );
}
