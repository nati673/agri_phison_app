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
  const filteredProducts = useMemo(() => {
    return (products || [])
      .filter(
        (p) =>
          (!businessUnitId || p.business_unit_id === businessUnitId) &&
          (!locationId ||
            p.location_id === locationId ||
            (p.location_ids || []).includes(locationId) ||
            (p.locations || []).some((loc) => loc.location_id === locationId))
      )
      .filter((p) => !selectedProductIds.includes(p.product_id));
  }, [products, businessUnitId, locationId, selectedProductIds]);

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
