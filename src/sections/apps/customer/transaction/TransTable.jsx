import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

// project-imports
import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/react-table';
import { useNavigate } from 'react-router';
import { Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format';

const columns = [
  { id: 'sale_id', label: 'Sale ID', minWidth: 100 },
  { id: 'product_id', label: 'Product ID', minWidth: 100 },
  { id: 'product_name', label: 'Product Name', minWidth: 170 },
  { id: 'product_brand', label: 'Product Brand', minWidth: 170 },
  { id: 'product_model', label: 'Product Model', minWidth: 170 },
  { id: 'product_quantity', label: 'Product Quantity', minWidth: 170, align: 'right' },
  { id: 'unit_price', label: 'Unit Price', minWidth: 170, align: 'right' },
  { id: 'total_price', label: 'Total Price', minWidth: 170, align: 'right' }
];

export default function TransactionTable({ title, type, data }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event?.target?.value);
    setPage(0);
  };
  const handleRowClick = () => {
    navigate('/apps/sales/sales-list');
  };

  const tableData = data || [];
  const totalPrice = tableData.reduce((acc, row) => acc + parseFloat(row.total_price), 0).toFixed(2);

  return (
    <MainCard content={false} title={title} secondary={<CSVExport data={tableData} filename={'sales-data.csv'} />}>
      {/* table */}

      {tableData.length > 0 ? (
        <>
          <TableContainer sx={{ maxHeight: 430 }}>
            <Table aria-label="sticky table">
              <TableHead
                sx={{
                  '& th': { borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `2px solid ${theme.palette.divider} !important` }
                }}
              >
                <TableRow>
                  {columns.map((column) => (
                    <TableCell sx={{ position: 'sticky !important' }} key={column.id} align={column.align}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow
                    sx={{ py: 3 }}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={index}
                    to="/apps/sales/sales-list"
                    onClick={handleRowClick}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === 'total_price' || column.id === 'unit_price' ? (
                            <NumericFormat value={value} displayType="text" thousandSeparator prefix="ETB" />
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: 'black' }}>
                  <TableCell>
                    <strong>Total</strong>
                  </TableCell>
                  {columns.slice(1, -1).map((column) => (
                    <TableCell key={column.id} />
                  ))}
                  <TableCell align="right">
                    <strong>
                      <NumericFormat value={totalPrice} displayType="text" thousandSeparator prefix="ETB" />
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100, 125, 500]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <>
          <Typography align="center" variant="h4" sx={{ p: 3 }}>
            There is No {title}
          </Typography>
        </>
      )}
    </MainCard>
  );
}
