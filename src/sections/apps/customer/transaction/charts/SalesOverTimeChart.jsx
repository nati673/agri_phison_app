import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { ThemeMode } from 'config';

const areaChartOptions = {
  chart: {
    type: 'area',
    toolbar: { show: false }
  },
  dataLabels: { enabled: false },
  stroke: { width: 1 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0
    }
  },
  grid: { strokeDashArray: 4 }
};

export default function SalesOverTimeChart({ transaction }) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const monthlyTotals = {};
  transaction?.sales?.forEach((sale) => {
    const month = new Date(sale.sale_date).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(sale.total_amount);
  });
  const categories = Object.keys(monthlyTotals);
  const seriesData = Object.values(monthlyTotals);

  const [options, setOptions] = useState({
    ...areaChartOptions,
    xaxis: { categories },
    colors: [theme.palette.primary.main, theme.palette.primary],
    title: { text: 'Sales Over Time', align: 'left' },
    yaxis: {
      labels: { style: { colors: [secondary] } }
    },
    grid: { borderColor: line },
    theme: {
      mode: mode === ThemeMode.DARK ? 'dark' : 'light'
    }
  });

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      xaxis: {
        ...prev.xaxis,
        categories,
        labels: {
          style: { colors: categories.map(() => secondary) }
        },
        axisBorder: { show: false, color: line },
        axisTicks: { show: false },
        tickAmount: Math.max(0, categories.length - 1)
      },
      colors: [theme.palette.primary.main, theme.palette.primary],
      grid: { borderColor: line },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, theme.palette.primary.main, theme.palette.primary]);

  const series = [
    {
      name: 'Total Sales',
      data: seriesData
    }
  ];

  return <ReactApexChart options={options} series={series} type="area" height={260} />;
}
