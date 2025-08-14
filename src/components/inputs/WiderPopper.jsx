// components/WiderPopper.js
import React from 'react';
import Popper from '@mui/material/Popper';
import { useTheme, useMediaQuery } from '@mui/material';

const WiderPopper = (props) => {
  const theme = useTheme();

  // Breakpoints for responsiveness
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // phones
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  let popperWidth;
  if (isXs) {
    popperWidth = '70vw';
  } else if (isSm) {
    popperWidth = 400;
  } else {
    popperWidth = 400;
  }

  return (
    <Popper
      {...props}
      style={{
        ...props.style,
        minWidth: popperWidth,
        width: popperWidth
      }}
    />
  );
};

export default WiderPopper;
