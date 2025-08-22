import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Fade from '@mui/material/Fade';

import { DebouncedInput } from 'components/third-party/react-table';
import ExpenseCard from 'sections/apps/expense/ExpenseCard';

// import ExpenseModal from './ExpenseModal';
// import EmptyExpenseCard from 'components/cards/skeleton/EmptyExpenseCard';

import usePagination from 'hooks/usePagination';
import { useGetExpenses } from 'api/expense';

import { Add, SearchNormal1 } from 'iconsax-react';
import { useNavigate } from 'react-router';
import EmptyExpenseCard from 'sections/apps/expense/EmptyExpenseCard';

// Filter and sort options - customize as needed
const sortFields = [
  { id: 1, header: 'Default' },
  { id: 2, header: 'Category' },
  { id: 3, header: 'Paid To' },
  { id: 4, header: 'Amount' },
  { id: 5, header: 'Date' },
  { id: 6, header: 'Business Unit' },
  { id: 7, header: 'Location' }
];

function sortExpenses(data, sortBy) {
  if (sortBy === 'Category') return [...data].sort((a, b) => a.category.localeCompare(b.category));
  if (sortBy === 'Paid To') return [...data].sort((a, b) => a.paid_to.localeCompare(b.paid_to));
  if (sortBy === 'Amount') return [...data].sort((a, b) => Number(b.amount) - Number(a.amount));
  if (sortBy === 'Date') return [...data].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  if (sortBy === 'Business Unit') return [...data].sort((a, b) => a.unit_name.localeCompare(b.unit_name));
  if (sortBy === 'Location') return [...data].sort((a, b) => a.location_name.localeCompare(b.location_name));
  return data;
}

export default function ExpenseCardPage() {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { expenses: lists, expensesEmpty, expensesError, expensesLoading, expensesValidating } = useGetExpenses();

  const [sortBy, setSortBy] = useState('Default');
  const [globalFilter, setGlobalFilter] = useState('');
  const [expCards, setExpCards] = useState([]);
  const [page, setPage] = useState(1);
  const [expenseModal, setExpenseModal] = useState(false);
  const navigate = useNavigate();
  const PER_PAGE = 6;
  const count = Math.ceil(expCards.length / PER_PAGE);
  const _DATA = usePagination(expCards, PER_PAGE);

  // Filter and sort logic
  useEffect(() => {
    if (lists && lists.length > 0) {
      const filtered = lists.filter((item) => {
        if (globalFilter) {
          return (
            item.paid_to?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            item.category?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            item.unit_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            item.location_name?.toLowerCase().includes(globalFilter.toLowerCase())
          );
        }
        return true;
      });

      setExpCards(sortExpenses(filtered, sortBy));
    }
  }, [lists, globalFilter, sortBy]);

  const handleChangeSort = (event) => {
    setSortBy(event.target.value);
  };

  const handleChangePage = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <>
      <Box sx={{ position: 'relative', marginBottom: 3 }}>
        <Stack direction="row" alignItems="center">
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            sx={{ width: '100%' }}
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <DebouncedInput
              value={globalFilter ?? ''}
              onFilterChange={(value) => setGlobalFilter(String(value))}
              placeholder={`Search ${expCards.length} expenses...`}
              startAdornment={<SearchNormal1 size={18} />}
            />
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
              <FormControl sx={{ m: '8px !important', minWidth: 130 }}>
                <Select
                  value={sortBy}
                  onChange={handleChangeSort}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Sort By' }}
                  renderValue={(selected) =>
                    !selected ? (
                      <Typography variant="subtitle1">Sort By</Typography>
                    ) : (
                      <Typography variant="subtitle2">Sort by ({sortBy})</Typography>
                    )
                  }
                >
                  {sortFields.map((field) => (
                    <MenuItem key={field.id} value={field.header}>
                      {field.header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => navigate('/workspace/expense/add-expense')} size="large" startIcon={<Add />}>
                Add Expense
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={3}>
        {expCards.length > 0 ? (
          _DATA.currentData().map((expense) => (
            <Fade key={expense.expense_id} in={true}>
              <Grid item xs={12} sm={6} lg={4}>
                <ExpenseCard expense={expense} />
              </Grid>
            </Fade>
          ))
        ) : (
          <Grid item xs={12}>
            <EmptyExpenseCard onAddExpense={() => navigate('/workspace/expense/add-expense')} />
          </Grid>
        )}
      </Grid>
      <Stack spacing={2} sx={{ p: 2.5 }} alignItems="flex-end">
        <Pagination
          count={count}
          page={page}
          showFirstButton
          showLastButton
          color="primary"
          onChange={handleChangePage}
          sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
        />
      </Stack>
      {/* <ExpenseModal open={expenseModal} onClose={() => setExpenseModal(false)} /> */}
    </>
  );
}
