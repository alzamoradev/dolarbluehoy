'use client';

import { useEffect } from 'react';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutos en milisegundos

export default function AutoRefresh() {
  useEffect(() => {
    const timer = setInterval(() => {
      window.location.reload();
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return null;
}
