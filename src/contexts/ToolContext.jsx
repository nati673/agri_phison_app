// src/contexts/ToolContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import useBarcodeScanner from 'utils/scan';
import socket from 'utils/socket';

const ToolContext = createContext();

export const ToolProvider = ({ children }) => {
  const [barcodes, setBarcodes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeBarcode, setActiveBarcode] = useState(null);
  const [scanHandlerActive, setScanHandlerActive] = useState(true);

  useBarcodeScanner((barcode) => {
    if (!scanHandlerActive) return;
    console.log('📥 Barcode scanned via scanner:', barcode);
    setBarcodes((prev) => [barcode, ...prev]);
    setActiveBarcode(barcode);
    setModalVisible(true);
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // socket.on('barcode_scanned', (data) => {
    //   console.log('📥 Barcode received:', data);
    //   setBarcodes((prev) => [data, ...prev]);
    //   setActiveBarcode(data);
    //   setModalVisible(true); // open modal
    // });

    socket.on('remote_navigate', ({ path, sender }) => {
      console.log(`➡️ Remote navigation to: ${path} from ${sender}`);
      window.location.href = path;
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('barcode_scanned');
      socket.off('remote_navigate');
    };
  }, []);

  const sendRemoteNavigate = (path) => {
    if (socket.connected) {
      socket.emit('remote_navigate', { path });
      console.log('📤 Sent remote navigation:', path);
    } else {
      console.warn('⚠️ Socket not connected');
    }
  };

  return (
    <ToolContext.Provider
      value={{
        barcodes,
        activeBarcode,
        modalVisible,
        setModalVisible,
        sendRemoteNavigate,
        scanHandlerActive,
        setScanHandlerActive // add this
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};

export const useTool = () => useContext(ToolContext);
