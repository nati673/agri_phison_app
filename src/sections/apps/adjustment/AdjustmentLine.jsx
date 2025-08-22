import React from 'react';
import { Grid, Autocomplete, TextField, IconButton } from '@mui/material';
import { Trash, PenRemove, AddCircle } from 'iconsax-react';
import { useGetProductBatches } from 'api/products';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';

function AdjustmentLine({
  idx,
  line,
  affectedType,
  products,
  handleLineChange,
  handleRemoveLine,
  handleClearLine,
  handleAddLine,
  selectedProductIds
}) {
  // Batch data for this product
  const { batches } = useGetProductBatches(line.product?.product_id);

  return (
    <>
      <Grid item xs={12} sm={4}>
        <ProductSelector
          products={products}
          selectedProductIds={selectedProductIds}
          value={line.product}
          onChange={(v) => handleLineChange(idx, 'product', v)}
        />
      </Grid>
      {/* Batch selector for batch-level adjustments */}
      {(affectedType === 'batch_qty' || affectedType === 'purchase_price') && (
        <Grid item xs={12} sm={3}>
          <Autocomplete
            fullWidth
            options={batches}
            getOptionLabel={(b) => b.batch_code || `Batch ${b.batch_id}`}
            value={line.batch || null}
            onChange={(e, v) => handleLineChange(idx, 'batch', v)}
            renderInput={(p) => <TextField {...p} label="Batch" size="small" sx={requiredInputStyle} />}
            disabled={!line.product}
          />
        </Grid>
      )}
      {/* Quantity Inputs */}
      <Grid item xs={6} sm={2}>
        <TextField
          label="Previous Quantity"
          type="number"
          value={line.previous_quantity}
          onChange={(e) => handleLineChange(idx, 'previous_quantity', e.target.value)}
          size="small"
          sx={requiredInputStyle}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={6} sm={2}>
        <TextField
          label="New Quantity"
          type="number"
          value={line.new_quantity}
          onChange={(e) => handleLineChange(idx, 'new_quantity', e.target.value)}
          size="small"
          sx={requiredInputStyle}
        />
      </Grid>
      {/* Value Inputs */}
      {(affectedType === 'purchase_price' || affectedType === 'selling_price') && (
        <>
          <Grid item xs={6} sm={2}>
            <TextField
              label="Prev Price"
              type="number"
              value={line.previous_unit_price}
              onChange={(e) => handleLineChange(idx, 'previous_unit_price', e.target.value)}
              size="small"
              sx={requiredInputStyle}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              label="New Price"
              type="number"
              value={line.new_unit_price}
              onChange={(e) => handleLineChange(idx, 'new_unit_price', e.target.value)}
              size="small"
              sx={requiredInputStyle}
            />
          </Grid>
        </>
      )}
      {/* Actions */}
      <Grid item xs={12} sm="auto">
        <IconButton color="error" onClick={() => handleRemoveLine(idx)}>
          <Trash />
        </IconButton>
        <IconButton color="warning" onClick={() => handleClearLine(idx)} size="small" aria-label="Clear Row" sx={{ ml: 1 }}>
          <PenRemove />
        </IconButton>
        <IconButton color="default" onClick={handleAddLine} size="small" aria-label="Add Row" sx={{ ml: 1 }}>
          <AddCircle />
        </IconButton>
      </Grid>
    </>
  );
}

export default AdjustmentLine;
