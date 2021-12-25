const a = 'A'.charCodeAt(0);
/*
  tabula recta
  Used to encipher a message using the Vignere cipher
  */
const recta = [...Array(26).keys()]
      .map((offset) => String.fromCharCode(a + offset))
      .map((first) => rowFrom(first));

/*
  Build an alphabet beginning with `char`

  rowFrom('c') => c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,a,b
  */
function rowFrom(char) {
  let startOffset = char.toUpperCase().charCodeAt(0) - a;
  return [...Array(26).keys()]
    .map((offset) => a + (offset + startOffset) % 26).
    map((charCode) => String.fromCharCode(charCode));
}

/*
  Encipher a message msg using key.
  */
export function encipher(msg, key) {
  // reject an empty key
  if(key.length < 1) return null;
  
  key = key.toUpperCase();
  msg = msg.toUpperCase();
  let keyStream = key.repeat(Math.ceil(msg / key));
  let keyLen = key.length;
  let msgStream = Array.from(msg).map((c, i) => [c, key[i % keyLen]]);
  let glassChars = Array.from(" \t\n'1234567890.,<>-!@#$%^&*()[]{}_?");
  let enc = ([c, k]) => glassChars.includes(c) ? c : recta[offset(k)][offset(c)];

  return msgStream.map(enc).join('');
}

export function decipher(msg, key) {
  // return undeciphered message on empty key
  if(key.length < 1) return msg;

  // sterilize key
  key = key.replace(/[^a-zA-Z]/g, '');

  key = key.toUpperCase();
  msg = msg.toUpperCase();
  let keyStream = key.repeat(Math.ceil(msg / key));
  let keyLen = key.length;
  let msgStream = Array.from(msg).map((c, i) => [c, key[i % keyLen]]);
  let glassChars = Array.from(" \t\n'1234567890.,<>-!@#$%^&*()[]{}_?");
  let dec = ([c,k]) => glassChars.includes(c) ? c : recta[0][recta[offset(k)].indexOf(c)];

  return msgStream.map(dec).join('');
}

function offset(char) {
  return char.charCodeAt(0) - a;
}
