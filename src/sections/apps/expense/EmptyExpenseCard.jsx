import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Add } from 'iconsax-react';

export default function EmptyExpenseCard({ onAddExpense }) {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9FAFB',
        borderRadius: 2,
        boxShadow: 0,
        p: 4,
        mb: 3
      }}
    >
      <Typography variant="h5" color="textSecondary" mb={2}>
        No expenses found
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        Get started by adding your first expense. Track, manage, and analyze costs easily.
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={onAddExpense} size="large">
        Add Expense
      </Button>
    </Box>
  );
}
