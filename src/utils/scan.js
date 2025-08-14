import { useEffect } from 'react';

const useBarcodeScanner = (onScanSuccess) => {
  useEffect(() => {
    let buffer = '';
    let timeout;

    const handleKeyPress = (e) => {
      if (timeout) clearTimeout(timeout);

      if (e.key.length === 1) {
        buffer += e.key;
      }

      if (e.key === 'Enter' && buffer) {
        onScanSuccess(buffer);
        buffer = '';
        return;
      }

      timeout = setTimeout(() => {
        buffer = '';
      }, 100);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onScanSuccess]);
};

export default useBarcodeScanner;
