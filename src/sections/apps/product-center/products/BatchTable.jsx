import React, { useMemo, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography
} from '@mui/material';

export default function BatchTable({ batches }) {
  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filtering
  const filteredBatches = useMemo(() => {
    if (!search) return batches;
    return batches.filter((batch) =>
      Object.values(batch).some((value) => value && value.toString().toLowerCase().includes(search.toLowerCase()))
    );
  }, [batches, search]);

  // Pagination
  const paginatedBatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);

  return (
    <>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search batches..."
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0); // reset page when searching
        }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          backdropFilter: 'blur(6px)'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Batch Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Manuf</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBatches.map((batch) => (
              <TableRow
                key={batch.batch_id}
                hover
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  transition: 'background 0.2s ease-in-out',
                  cursor: 'default'
                }}
              >
                <TableCell>{batch.batch_code}</TableCell>
                <TableCell>
                  <Typography color="success.main" fontWeight={600}>
                    {batch.quantity}
                  </Typography>
                </TableCell>
                <TableCell>
                  {batch.manufacture_date && new Date(batch.manufacture_date).toLocaleDateString() !== 'Invalid Date'
                    ? new Date(batch.manufacture_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {batch.created_at ? new Date(batch.created_at).toLocaleString() : ''}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredBatches.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 75, 100, 125, 150, 200, 500, 1000]}
        />
      </TableContainer>
    </>
  );
}
