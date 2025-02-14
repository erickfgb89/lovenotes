import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

export default function Header() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        🏠
      </Link>
      <div className={styles.authButtons}>
        {userData ? (
          <>
            <span className={styles.welcome}>Welcome, {userData.name}!</span>
            <Link href="/settings" className={styles.iconButton}>
              ⚙️
            </Link>
            <button onClick={handleLogout} className={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.button}>
              Login
            </Link>
            <Link href="/signup" className={styles.button}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
