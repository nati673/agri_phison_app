export const requiredInputStyle = {
  '& .MuiOutlinedInput-root': {
    position: 'relative',
    paddingLeft: '8px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 1.8,
      bottom: 1.8,
      left: 1,
      width: 4.8,
      borderTopLeftRadius: 100,
      borderBottomLeftRadius: 100,
      backgroundColor: '#008245'
    }
  },
  '& .MuiInputBase-root': { height: 48 }
};
