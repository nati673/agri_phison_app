import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Checkbox,
  Tooltip
} from '@mui/material';
import { DocumentDownload, Eye } from 'iconsax-react';
import jsPDF from 'jspdf';

import { getBarcode, getProductBarcodeBySKU } from 'api/barcode';
import useAuth from 'hooks/useAuth';
import { useGetProductCategories } from 'api/product_category';
import { useGetLocation } from 'api/location';
import { useGetBusinessUnit } from 'api/business_unit';
import useBarcodeScanner from 'utils/scan';

const ProductBarcodes = () => {
  const { user } = useAuth();
  const { productCategories } = useGetProductCategories();
  const { locations } = useGetLocation();
  const { BusinessUnits } = useGetBusinessUnit();
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);

  const [filters, setFilters] = useState({
    company_id: user?.company_id,
    category_id: 'all',
    location_id: 'all',
    business_unit_id: 'all',
    search: '',
    sku: ''
  });

  const [productBarcodes, setProductBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store barcode image URLs by SKU for viewing
  const [barcodeImages, setBarcodeImages] = useState({});

  // PDF format state
  const [pdfFormat, setPdfFormat] = useState('A4'); // 'A4' or 'Thermal'

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedBarcodes.length === productBarcodes.length) {
      // Deselect all
      setSelectedBarcodes([]);
    } else {
      // Select all product ids
      setSelectedBarcodes(productBarcodes.map((p) => p.product_id));
    }
  };
  // Handle checkbox toggle per product
  const handleToggleSelect = (productId) => {
    setSelectedBarcodes((prevSelected) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter((id) => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };
  useEffect(() => {
    if (!user?.company_id) return;

    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await getBarcode(user.company_id, filters);
        setProductBarcodes(data);
        setBarcodeImages({});
      } catch (error) {
        console.error('Failed to load product barcodes', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filters, user?.company_id]);

  const handleDownloadBarcode = async (sku, productName) => {
    try {
      const blob = await getProductBarcodeBySKU(user.company_id, sku);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${productName || sku}-barcode.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download barcode', error);
    }
  };

  const handleShowBarcode = async (sku) => {
    if (barcodeImages[sku]) {
      // Hide barcode if already shown
      setBarcodeImages((prev) => {
        const copy = { ...prev };
        delete copy[sku];
        return copy;
      });
      return;
    }
    try {
      const blob = await getProductBarcodeBySKU(user.company_id, sku);
      const url = window.URL.createObjectURL(blob);
      setBarcodeImages((prev) => ({
        ...prev,
        [sku]: url
      }));
    } catch (error) {
      console.error('Failed to load barcode image', error);
    }
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(barcodeImages).forEach((url) => window.URL.revokeObjectURL(url));
    };
  }, [barcodeImages]);

  // Convert Blob to Data URL (base64) for jsPDF
  const blobToBase64 = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

  // Generate PDF function
  const generatePDF = async () => {
    // if (productBarcodes.length === 0) return;
    if (selectedBarcodes.length === 0) {
      alert('Please select some products to generate PDF.');
      return;
    }
    const selectedProducts = productBarcodes.filter((p) => selectedBarcodes.includes(p.product_id));
    const doc = new jsPDF({
      unit: 'mm',
      format: pdfFormat === 'A4' ? 'a4' : [80, 200] // thermal label size smaller width
    });

    if (pdfFormat === 'A4') {
      const margin = 10;
      const padding = 5;
      const imagesPerRow = 4;
      const pageWidth = 210; // A4 width in mm
      const usableWidth = pageWidth - 2 * margin - (imagesPerRow - 1) * padding;
      const imgWidth = usableWidth / imagesPerRow;
      const imgHeight = 15; // fixed height for barcode images
      let x = margin;
      let y = margin;
      let countInRow = 0;
      const pageHeight = 297;

      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        try {
          const blob = await getProductBarcodeBySKU(user.company_id, product.sku);
          const imgData = await blobToBase64(blob);

          doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

          x += imgWidth + padding;
          countInRow++;
          if (countInRow === imagesPerRow) {
            countInRow = 0;
            x = margin;
            y += imgHeight + padding;
            if (y + imgHeight + margin > pageHeight) {
              doc.addPage();
              y = margin;
            }
          }
        } catch (error) {
          console.error('Error adding barcode to PDF:', product.sku, error);
        }
      }
    } else if (pdfFormat === 'Thermal') {
      const margin = 5;
      const imgWidth = 60;
      const imgHeight = 15;
      const pageWidth = 80;
      const pageHeight = 200;
      let x = (pageWidth - imgWidth) / 2;
      let y = margin;

      for (let product of selectedProducts) {
        try {
          const blob = await getProductBarcodeBySKU(user.company_id, product.sku);
          const imgData = await blobToBase64(blob);

          if (y + imgHeight + margin > pageHeight) {
            doc.addPage();
            y = margin;
          }

          doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
          y += imgHeight + margin;
        } catch (error) {
          console.error('Error adding barcode to PDF:', product.sku, error);
        }
      }
    }

    doc.save(`ProductBarcodes_${pdfFormat}.pdf`);
  };

  const [d, setD] = useState(null);
  const ref = useRef(null);
  const playBeep = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };
  useBarcodeScanner((code) => {
    setD(code);
    setTimeout(() => {
      playBeep();
    }, 1000);

    console.log('Scanned:', code);
  });

  return (
    <Container ref={ref} maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" color="text.primary" gutterBottom>
        Product Barcodes DATA: {d}
      </Typography>
      {/* <BarcodeReader onError={handleError} onScan={handleScan} /> */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 4,
          bgcolor: (theme) => theme.palette.background.default
        }}
      >
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            '& .MuiFormControl-root': { minWidth: 180 }
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Search product or SKU"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: 280 }}
          />

          <FormControl size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select labelId="category-label" name="category_id" value={filters.category_id} label="Category" onChange={handleFilterChange}>
              <MenuItem value="all">All Categories</MenuItem>
              {productCategories?.map((cat) => (
                <MenuItem key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="location-label">Location</InputLabel>
            <Select labelId="location-label" name="location_id" value={filters.location_id} label="Location" onChange={handleFilterChange}>
              <MenuItem value="all">All Locations</MenuItem>
              {locations?.map((loc) => (
                <MenuItem key={loc.location_id} value={loc.location_id}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="business-unit-label">Business Unit</InputLabel>
            <Select
              labelId="business-unit-label"
              name="business_unit_id"
              value={filters.business_unit_id}
              label="Business Unit"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Units</MenuItem>
              {BusinessUnits?.map((bu) => (
                <MenuItem key={bu.business_unit_id} value={bu.business_unit_id}>
                  {bu.unit_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <TextField
            label="SKU"
            name="sku"
            value={filters.sku}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ maxWidth: 180 }}
          /> */}
        </Box>
      </Paper>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap'
        }}
      >
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="pdf-format-label">Download PDF Format</InputLabel>
          <Select labelId="pdf-format-label" value={pdfFormat} label="Download PDF Format" onChange={(e) => setPdfFormat(e.target.value)}>
            <MenuItem value="A4">A4 (Standard Paper - Used with regular office printers)</MenuItem>
            <MenuItem value="Thermal">Thermal Printer (Used for small labels, receipts, and shipping tags)</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Download barcode PDFs for your printer (choose format before downloading)">
          <Button variant="contained" onClick={generatePDF} disabled={productBarcodes.length === 0} startIcon={<DocumentDownload />}>
            Download PDF (Recommended)
          </Button>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress color="primary" />
        </Box>
      ) : productBarcodes.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No products found.
        </Typography>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            bgcolor: (theme) => theme.palette.background.paper,
            maxHeight: 520,
            overflowY: 'auto'
          }}
        >
          <List dense>
            {/* Select All Checkbox header */}
            <ListItem dense divider sx={{ bgcolor: 'background.default' }}>
              <Checkbox
                edge="start"
                checked={selectedBarcodes.length === productBarcodes.length}
                indeterminate={selectedBarcodes.length > 0 && selectedBarcodes.length < productBarcodes.length}
                onChange={handleSelectAll}
                inputProps={{ 'aria-label': 'select all products' }}
              />
              <ListItemText primary="Select All" />
            </ListItem>
            {productBarcodes.map((product) => (
              <Box key={product.product_id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <ListItem
                  divider
                  secondaryAction={
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Eye size={20} variant="Bulk" />}
                        onClick={() => handleShowBarcode(product.sku)}
                        color="info"
                        sx={{ mr: 1 }}
                      >
                        {barcodeImages[product.sku] ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DocumentDownload size={20} variant="Bulk" />}
                        onClick={() => handleDownloadBarcode(product.sku, product.product_name)}
                        color="primary"
                      >
                        Download PNG
                      </Button>
                    </Box>
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={selectedBarcodes.includes(product.product_id)}
                    tabIndex={-1}
                    disableRipple
                    onChange={() => handleToggleSelect(product.product_id)}
                    inputProps={{ 'aria-labelledby': `checkbox-list-label-${product.product_id}` }}
                  />
                  <ListItemText
                    primary={product.product_name}
                    secondary={`SKU: ${product.sku}`}
                    primaryTypographyProps={{ color: 'text.primary' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
                {barcodeImages[product.sku] && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: (theme) => theme.palette.background.default
                    }}
                  >
                    <img src={barcodeImages[product.sku]} alt={`Barcode for ${product.sku}`} style={{ maxWidth: '100%', height: 'auto' }} />
                  </Box>
                )}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default ProductBarcodes;
