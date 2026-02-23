import { useState, useEffect } from 'react';

interface Config {
  relayBaseUrl: string;
  appId: string;
}

const STORAGE_KEY = 'redledger_config';

const DEFAULT_CONFIG: Config = {
  relayBaseUrl: '',
  appId: '',
};

export function useRedLedgerConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored config:', err);
      }
    }
  }, []);

  const updateConfig = (updates: Partial<Config>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isValid = config.relayBaseUrl.trim() !== '' && config.appId.trim() !== '';

  return {
    config,
    updateConfig,
    resetConfig,
    isOpen,
    setIsOpen,
    isValid,
  };
}
