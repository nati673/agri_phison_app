import React, { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { renderProductOption } from 'components/inputs/renderProductOption';
import WiderPopper from 'components/inputs/WiderPopper';

export default function ProductSelector({
  products = [],
  businessUnitId,
  locationId,
  selectedProductIds = [],
  value,
  onChange,
  disabled = false,
  price
}) {
  // Only filter by location and businessUnitId, not by stock quantity
  const filteredProducts = useMemo(
    () =>
      (products || []).filter(
        (product) =>
          // There exists a stock entry for this location & business unit, no matter the quantity
          (product.stocks || []).some(
            (stock) => Number(stock.location_id) === Number(locationId) && Number(stock.business_unit_id) === Number(businessUnitId)
          ) && !selectedProductIds.includes(product.product_id)
      ),
    [products, businessUnitId, locationId, selectedProductIds]
  );

  return (
    <Autocomplete
      options={filteredProducts}
      getOptionLabel={(opt) => opt.product_name || ''}
      value={value}
      onChange={(e, newVal) => onChange(newVal)}
      renderOption={(props, option, state) => renderProductOption(props, option, state, price)}
      renderInput={(params) => <TextField {...params} label="Product" size="small" required />}
      isOptionEqualToValue={(o, v) => o.product_id === v.product_id}
      disabled={disabled}
      PopperComponent={WiderPopper}
    />
  );
}
