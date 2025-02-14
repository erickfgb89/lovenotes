import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Auth.module.css';
import crypto from 'crypto';

export default function Settings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error('All fields are required');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (formData.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // Get user data from localStorage
      if (!userData) {
        throw new Error('Please log in again');
      }

      // Hash the passwords
      const currentPasswordHash = crypto
        .createHash('sha256')
        .update(formData.currentPassword)
        .digest('hex');
      
      const newPasswordHash = crypto
        .createHash('sha256')
        .update(formData.newPassword)
        .digest('hex');

      // Send request to update password
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          currentPassword: currentPasswordHash,
          newPassword: newPasswordHash
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      // Clear form and show success message
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Settings - Love Notes</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Settings</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={userData?.username || ''}
              disabled
              className={styles.disabledInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              value={userData?.role || 'user'}
              disabled
              className={styles.disabledInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </main>
    </div>
  );
}
