import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Tooltip,
  Collapse,
  Snackbar
} from '@mui/material';
import { CloseCircle, ArrowDown, ArrowUp } from 'iconsax-react';
import { fetchProductBatches, updateProductBatch } from 'api/products';
import toast from 'react-hot-toast';

// Inline editable cell, only for updateable fields
function EditableBatchCell({ value, field, batchId, businessUnitId, locationId, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(field.includes('date') && value ? value.split('T')[0] : value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewValue(field.includes('date') && value ? value.split('T')[0] : value);
  }, [value]);

  const handleSave = async () => {
    if (newValue !== value) {
      setLoading(true);
      try {
        await onUpdate(batchId, { [field]: newValue, business_unit_id: businessUnitId, location_id: locationId });
      } catch (e) {
        // handle error (propagate to parent if needed)
      }
      setLoading(false);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type={field.includes('date') ? 'date' : 'text'}
        value={newValue || ''}
        autoFocus
        onChange={(e) => setNewValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        style={{ minWidth: 80 }}
        disabled={loading}
      />
    );
  }

  return (
    <span
      style={{ cursor: 'pointer', background: '#fafbfd', padding: 3, borderRadius: 2 }}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      {field.includes('date') ? (value ? new Date(value).toLocaleDateString() : '-') : value || '-'}
    </span>
  );
}

export function ProductBatchesModal({ open, onClose, product, businessUnitId, locationId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!open || !product?.product_id) return;
    setLoading(true);
    setError(null);
    fetchProductBatches(product.product_id, businessUnitId, locationId)
      .then((result) => {
        setBatches(result.data || []);
        setError(result.error);
        setLoading(false);
      })
      .catch((err) => {
        setBatches([]);
        setError(err.message || String(err));
        setLoading(false);
      });
  }, [open, product?.product_id, businessUnitId, locationId]);

  const handleExpandClick = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const showNoBatches = !loading && batches.length === 0;

  const handleBatchFieldUpdate = async (batchId, payload) => {
    try {
      const result = await updateProductBatch(batchId, payload);
      setBatches((prev) => prev.map((batch) => (batch.batch_id === batchId ? { ...batch, ...payload } : batch)));

      if (result.success) {
        toast.success(result.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        Batches for <strong>{product?.product_name}</strong>
        <IconButton onClick={onClose} color="error" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseCircle color="red" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {showNoBatches && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography>No batches found for this product.</Typography>
          </Box>
        )}

        {batches.length > 0 && (
          <TableContainer sx={{ maxHeight: '65vh' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#76CA2C' }}>
                <TableRow>
                  <TableCell>Batch Code</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Initial Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Selling Price</TableCell>
                  <TableCell>Manufacture Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((batch) => (
                  <React.Fragment key={batch.batch_id}>
                    <TableRow hover>
                      <TableCell>
                        <EditableBatchCell
                          value={batch.batch_code}
                          field="batch_code"
                          batchId={batch.batch_id}
                          businessUnitId={businessUnitId}
                          locationId={locationId}
                          disabled={batch.batch_code === 'INIT'}
                          onUpdate={handleBatchFieldUpdate}
                        />
                      </TableCell>
                      <TableCell>{batch.location_name}</TableCell>
                      <TableCell>{batch.business_unit}</TableCell>
                      <TableCell align="right">{parseFloat(batch.quantity).toLocaleString()}</TableCell>
                      <TableCell align="right">{parseFloat(batch.initial_quantity).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        ETB {parseFloat(batch.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ETB {parseFloat(batch.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell>
                        <EditableBatchCell
                          value={batch.manufacture_date}
                          field="manufacture_date"
                          batchId={batch.batch_id}
                          businessUnitId={businessUnitId}
                          locationId={locationId}
                          onUpdate={handleBatchFieldUpdate}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableBatchCell
                          value={batch.expiry_date}
                          field="expiry_date"
                          batchId={batch.batch_id}
                          businessUnitId={businessUnitId}
                          locationId={locationId}
                          onUpdate={handleBatchFieldUpdate}
                        />
                      </TableCell>
                      <TableCell>{batch.created_at ? new Date(batch.created_at).toLocaleString() : '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={expanded[batch.batch_id] ? 'Hide Details' : 'Show Details'}>
                          <IconButton size="small" onClick={() => handleExpandClick(batch.batch_id)}>
                            {expanded[batch.batch_id] ? <ArrowUp /> : <ArrowDown />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expanded[batch.batch_id]} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
                            <Typography variant="subtitle2">Batch Details</Typography>
                            <Typography variant="body2">Purchase ID: {batch.purchase_id ?? 'N/A'}</Typography>
                            <Typography variant="body2">Created By: {batch.created_by ?? 'N/A'}</Typography>
                            <Typography variant="body2">Product Name: {batch.product_name}</Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {(() => {
                  const batchTotals = batches.reduce(
                    (acc, batch) => ({
                      quantity: acc.quantity + Number(batch.quantity),
                      purchase: acc.purchase + Number(batch.quantity) * Number(batch.purchase_price),
                      selling: acc.selling + Number(batch.quantity) * Number(batch.selling_price)
                    }),
                    { quantity: 0, purchase: 0, selling: 0 }
                  );
                  return (
                    <TableRow sx={{ backgroundColor: '#E3C84C', fontWeight: 'bold' }}>
                      <TableCell colSpan={1} sx={{ fontWeight: 'bold' }}>
                        Total
                      </TableCell>

                      <TableCell />
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {batchTotals.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ETB {batchTotals.purchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ETB {batchTotals.selling.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
