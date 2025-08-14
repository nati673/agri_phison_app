// src/components/BarcodeModal.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTool } from 'contexts/ToolContext';
import { ScanBarcode } from 'iconsax-react';

const BarcodeModal = () => {
  const { modalVisible, setModalVisible, activeBarcode } = useTool();

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <Dialog open={modalVisible} onClose={handleClose}>
      <DialogTitle>
        <ScanBarcode size="24" style={{ marginRight: 8 }} />
        Barcode Scanned
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">📦 Product ID: {activeBarcode?.product_id}</Typography>
        <Typography variant="body2" color="text.secondary">
          📄 Data: {activeBarcode?.data}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="success">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeModal;
