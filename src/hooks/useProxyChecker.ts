'use client';

import { useState } from 'react';
import type { IpWhoResult } from '@/lib/ipwho';

const API_BASE = '/api';

export type CheckerStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProxyChecker() {
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState<CheckerStatus>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<IpWhoResult | null>(null);

  const runCheck = async (endpoint: string) => {
    setStatus('loading');
    setMessage('');
    setResult(null);

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setResult(data.data);
        if (data.data?.ip) {
          setIp(data.data.ip);
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Could not check this IP address.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to server. Please try again.');
    }
  };

  const checkIp = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter an IP address.');
      return;
    }
    runCheck(`${API_BASE}/proxy-check?ip=${encodeURIComponent(trimmed)}`);
  };

  const checkMyIp = () => {
    runCheck(`${API_BASE}/proxy-check?myip=1`);
  };

  return {
    ip,
    setIp,
    status,
    message,
    result,
    checkIp,
    checkMyIp,
  };
}
