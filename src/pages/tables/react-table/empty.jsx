import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// tanstack/react-table
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

// Icons
// import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

// Pagination UI placeholder (disabled)
import TablePagination from 'components/third-party/react-table/TablePagination';
import { TableFooter } from '@mui/material';

const EmptyTableMessage = ({ msg }) => (
  <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 6, color: 'text.secondary' }}>
    {/* <SentimentDissatisfiedIcon sx={{ fontSize: 40 }} /> */}
    <Typography variant="h6">{msg}</Typography>
    <Typography variant="body2" sx={{ maxWidth: 400, textAlign: 'center' }}>
      No records found. Please check back later or try adjusting filters.
    </Typography>
  </Stack>
);

const EmptyReactTable = ({ columns }) => {
  const theme = useTheme();
  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  // Empty data
  const [data] = useState([]);

  // Setup react-table instance with sorting enabled (no data)
  const [sorting, setSorting] = useState([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <MainCard content={false} sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <ScrollX>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'background.paper' }}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: 'text.primary',
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                          cursor: canSort ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                            {canSort && (
                              <span>
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽'
                                }[header.column.getIsSorted()] ?? '⇅'}
                              </span>
                            )}
                          </Stack>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>

            <TableBody>
              {/* Render 5 skeleton rows with alternating background */}
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow
                  key={`skeleton-${i}`}
                  sx={{
                    backgroundColor: i % 2 === 0 ? theme.palette.action.hover : theme.palette.background.default
                  }}
                >
                  {columns.map((col, idx) => (
                    <TableCell key={idx}>
                      <Skeleton variant="rounded" width="80%" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Empty State */}
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6 }}>
                  <EmptyTableMessage msg="No Data Available" />
                </TableCell>
              </TableRow>
            </TableBody>

            {/* Empty footer with consistent styling */}
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', opacity: 0.5 }}>
                    <Typography variant="body2">No pagination available</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </ScrollX>
    </MainCard>
  );
};

EmptyReactTable.propTypes = {
  columns: PropTypes.array.isRequired
};

export default EmptyReactTable;
