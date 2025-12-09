'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zaten giriş yapılmışsa yönlendir
  React.useEffect(() => {
    if (user && !isLoading) {
      redirectByRole(user.role);
    }
  }, [user, isLoading]);

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'TEAM_LEAD':
        router.push('/team-lead');
        break;
      default:
        router.push('/employee');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        // Login başarılı, useEffect yönlendirecek
      } else {
        setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">📝</div>
          <h1 className="login-title">İş Takip Sistemi</h1>
          <p className="login-subtitle">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Kullanıcı Adı"
            type="text"
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Şifre"
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="alert alert-error mb-4">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">{error}</div>
            </div>
          )}

          <Button type="submit" block isLoading={isSubmitting}>
            Giriş Yap
          </Button>
        </form>


      </div>
    </div>
  );
}
