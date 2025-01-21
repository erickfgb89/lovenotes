import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Header.module.css';
import HomeIcon from './icons/HomeIcon';

const Header = () => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          LoveNotes
        </Link>
        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <Link 
              href="/" 
              className={`${styles.link} ${styles.homeLink} ${router.pathname === '/' ? styles.active : ''}`}
              title="Home"
            >
              <HomeIcon className={styles.homeIcon} />
            </Link>
            <Link 
              href="/notes" 
              className={`${styles.link} ${router.pathname === '/notes' ? styles.active : ''}`}
            >
              My Notes
            </Link>
            <Link 
              href="/create" 
              className={`${styles.link} ${router.pathname === '/create' ? styles.active : ''}`}
            >
              Create Note
            </Link>
          </nav>
          <Link 
            href="/login" 
            className={`${styles.link} ${styles.loginLink} ${router.pathname === '/login' ? styles.active : ''}`}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
