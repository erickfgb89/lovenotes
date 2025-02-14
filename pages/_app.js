import '../styles/globals.css';
import Header from '../components/Header';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
