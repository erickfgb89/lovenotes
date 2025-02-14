import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Auth.module.css';
import { encipher } from '../../lib/cipherHelpers.js';
import crypto from 'crypto';

export default function NewNote() {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    text: '',
    key: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Special handling for id and key
    if (name === 'id') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    } else if (name === 'key') {
      processedValue = value.toUpperCase().replace(/[^A-Z]/g, '');
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.id || !formData.title || !formData.text || !formData.key) {
        throw new Error('All fields are required');
      }

      // Encrypt the text
      const encipheredText = encipher(formData.text, formData.key);
      if (!encipheredText) {
        throw new Error('Failed to encrypt text');
      }

      // Generate SHA256 of the key
      const keySHA256 = crypto.createHash('sha256').update(formData.key).digest('hex');

      // Save to DynamoDB
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          text: encipheredText,
          cipherKey: formData.key,
          cipherKeySHA256: keySHA256
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create note');
      }

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create New Note - Love Notes</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Create New Note</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="id">Note ID (URL-safe characters only)</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              placeholder="e.g., first-date"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="text">Note Text</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows={10}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="key">Cipher Key (letters only)</label>
            <input
              type="text"
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              required
              placeholder="e.g., LOVEYOU"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Creating Note...' : 'Create Note'}
          </button>
        </form>
      </main>
    </div>
  );
}
