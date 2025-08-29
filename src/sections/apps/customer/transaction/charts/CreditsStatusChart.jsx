import ReactApexChart from 'react-apexcharts';

// Status color map (choose modern, high-contrast colors to match your theme)
const STATUS_COLOR_MAP = {
  paid: '#53da90', 
  unpaid: '#ff6b6b', 
  'partially paid': '#ffc95a'
};

export default function CreditsStatusChart({ transaction }) {
  // Aggregate status counts
  const statusCounts = {};
  transaction.credits.forEach((credit) => {
    statusCounts[credit.status] = (statusCounts[credit.status] || 0) + 1;
  });
  const labels = Object.keys(statusCounts);
  const seriesData = Object.values(statusCounts);

  // Assign colors based on fixed status order
  const pieColors = labels.map((label) => STATUS_COLOR_MAP[label] || '#c1c1c1');

  const options = {
    labels,
    colors: pieColors,
    legend: {
      show: true,
      position: 'right',
      labels: { colors: ['#222'], useSeriesColors: false },
      formatter: (val, opts) => `${val}: ${seriesData[opts.seriesIndex]}`
    },
    title: {
      text: 'Credits by Status',
      align: 'left'
      
    },
    stroke: { width: 2, colors: ['#fff'] },
    dataLabels: {
      style: { fontWeight: 700, colors: ['#111'] },
      dropShadow: { enabled: false }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: { show: true, fontWeight: 700, color: '#222' },
            value: {
              show: true,
              fontWeight: 900,
              color: '#222',
              formatter: (v) => v
            },
            total: {
              show: true,
              label: 'Total',
              fontWeight: 900,
              color: '#222',
              formatter: () => seriesData.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    }
  };

  return <ReactApexChart options={options} series={seriesData} type="donut" height={320} />;
}
