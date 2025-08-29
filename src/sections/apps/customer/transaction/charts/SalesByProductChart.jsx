import ReactApexChart from 'react-apexcharts';

export default function SalesByProductChart({ transaction }) {
  const productTotals = {};
  transaction.sales.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      productTotals[item.product_id] = (productTotals[item.product_id] || 0) + item.quantity;
    });
  });
  const categories = Object.keys(productTotals).map((p) => 'Product ' + p);
  const seriesData = Object.values(productTotals);

  const options = {
    chart: { type: 'bar' },
    xaxis: { categories },
    title: { text: 'Sales by Product', align: 'left' }
  };

  const series = [{ name: 'Items Sold', data: seriesData }];

  return <ReactApexChart options={options} series={series} type="bar" height={320} />;
}
