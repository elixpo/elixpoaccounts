'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    // Handle registration logic here
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0c0f0a 0%, #0f1410 50%, #0c0f0a 100%)', p: 2 }}>
      <Box sx={{ maxWidth: '420px', width: '100%', backdropFilter: 'blur(20px)', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f5f5f4', mb: 1 }}>Create Account</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.95rem' }}>Join us for GSoC 2026</Typography>
        </Box>

        {error && <Box sx={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', p: 2, borderRadius: '8px', mb: 3, fontSize: '0.9rem' }}>{error}</Box>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" sx={{ '& .MuiOutlinedInput-root': { color: '#f5f5f4', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#a3e635' } }} required />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" helperText="Minimum 8 characters" sx={{ '& .MuiOutlinedInput-root': { color: '#f5f5f4', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#a3e635' }, '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' } }} required />
          <TextField fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" sx={{ '& .MuiOutlinedInput-root': { color: '#f5f5f4', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, '&.Mui-focused fieldset': { borderColor: '#a3e635' } }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#a3e635' } }} required />

          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ my: 3, background: 'rgba(163, 230, 53, 0.15)', color: '#a3e635', border: '1px solid rgba(163, 230, 53, 0.3)', fontWeight: 600, py: 1.5, textTransform: 'none', fontSize: '1rem', '&:hover': { background: 'rgba(163, 230, 53, 0.25)', borderColor: 'rgba(163, 230, 53, 0.5)' }, '&:disabled': { color: 'rgba(255, 255, 255, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>Already have an account?</Typography>
          <Link href="/login" style={{ color: '#a3e635', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
