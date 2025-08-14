import axios from 'utils/axios';

export async function getBarcode(companyId, filter) {
  try {
    const { data } = await axios.post(`/barcode/list/${companyId}`, filter);

    return data.data;
  } catch (error) {
    console.error('Failed to filter products:', error);
    return [];
  }
}
export async function getProductBarcodeBySKU(companyId, sku) {
  const response = await axios.get(`/barcode/${companyId}`, {
    params: { sku },
    responseType: 'blob'
  });

  return response.data;
}
