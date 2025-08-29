import { useEffect, useRef } from 'react';

export function usePopulateSalesFromOrder({
  orderInfo,
  products,
  BusinessUnits,
  locations,
  customers,
  setSaleInfo,
  setEntries,
  initialEntry,
  handlePreview,
  entries
}) {
  const initialized = useRef(false);
  useEffect(() => {
    if (!orderInfo || !products) return;

    const itemsArray = Array.isArray(orderInfo.items) ? orderInfo.items : orderInfo.items ? [orderInfo.items] : [];

    const bu = BusinessUnits?.find((bu) => bu.business_unit_id === orderInfo.business_unit_id) || null;
    const loc = locations?.find((loc) => loc.location_id === orderInfo.location_id) || null;
    const cust = customers?.find((cust) => cust.customer_id === orderInfo.customer_id) || null;

    setSaleInfo({
      business_unit: bu,
      location: loc,
      customer: cust
    });

    const mappedEntries = itemsArray.map((item) => {
      const productObj = products?.find((p) => p.product_id === item.product_id) || null;
      return {
        product: productObj,
        quantity: item.quantity ?? '',
        price: productObj?.unit_price ?? '',
        discountPercent: '',
        discountAmount: '',
        totalPrice: ''
      };
    });

    setEntries(mappedEntries.length > 0 ? mappedEntries : [{ ...initialEntry }]);
    initialized.current = true;
  }, [orderInfo, BusinessUnits, locations, customers, products, setSaleInfo, setEntries, initialEntry]);

  useEffect(() => {
    if (initialized.current) {
      entries.forEach((entry, idx) => {
        if (entry.product && entry.quantity) {
          handlePreview(entry, idx);
        }
      });
      initialized.current = false;
    }
  }, [entries]);
}
