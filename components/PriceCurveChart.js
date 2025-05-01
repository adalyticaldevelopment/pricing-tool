import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  CategoryScale
} from 'chart.js';

// Create a custom plugin to draw the numbers
const numberPlugin = {
  id: 'numberPlugin',
  afterDatasetDraw(chart, args) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(1);
    const dataset = chart.data.datasets[1];

    if (!meta || !dataset || !dataset.rankingNumbers) return;

    ctx.save();
    ctx.font = 'bold 12px DM Sans';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    meta.data.forEach((point, index) => {
      if (dataset.data[index] !== null) {
        const number = dataset.rankingNumbers[index];
        if (number) {
          ctx.fillText(number.toString(), point.x, point.y);
        }
      }
    });

    ctx.restore();
  }
};

ChartJS.register(LineElement, LinearScale, PointElement, Tooltip, Filler, CategoryScale, numberPlugin);

export default function PriceCurveChart({ prices, topSixPrices }) {
  if (!prices || prices.length === 0) return null;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const normalized = prices.map(p => (p - minPrice) / (maxPrice - minPrice));

  const xLabels = Array.from({ length: 100 }, (_, i) => i / 99);
  const density = xLabels.map(x =>
    normalized.reduce((sum, p) => {
      const dist = (x - p) / 0.05;
      return sum + Math.exp(-0.5 * dist * dist);
    }, 0)
  );

  const maxDensity = Math.max(...density);

  // Create sparse arrays with null values except at price points
  const rankingData = new Array(100).fill(null);
  const rankingNumbers = new Array(100).fill(null);
  
  topSixPrices.forEach((price) => {
    const index = Math.round(((price - minPrice) / (maxPrice - minPrice)) * 99);
    if (index >= 0 && index < 100) {
      rankingData[index] = density[index];
      rankingNumbers[index] = topSixPrices.findIndex(p => Math.abs(p - price) < 1) + 1;
    }
  });

  const data = {
    labels: xLabels.map(x => Math.round(minPrice + x * (maxPrice - minPrice))),
    datasets: [
      {
        data: density,
        borderColor: '#48A031',
        backgroundColor: 'rgba(72, 160, 49, 0.2)',
        fill: true,
        tension: 0.35,
        pointRadius: 0
      },
      {
        data: rankingData,
        rankingNumbers,
        borderColor: 'transparent',
        backgroundColor: '#48A031',
        pointRadius: 15,
        pointStyle: 'circle',
        showLine: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        displayColors: false,
        backgroundColor: '#fff',
        titleColor: '#081F07',
        bodyColor: '#081F07',
        borderColor: '#48A031',
        borderWidth: 1,
        titleFont: { family: 'DM Sans', weight: '600', size: 14 },
        bodyFont: { family: 'DM Sans', weight: '400', size: 13 },
        callbacks: {
          title: context => `Price: $${context[0].label}`,
          label: context => {
            // Only show information for the first dataset (density curve)
            if (context.datasetIndex === 0) {
              const density = context.raw;
              if (density > 5) return '🔥 Most competitors here';
              if (density > 2) return '✅ Some competitors here';
              return '🌊 Few competitors here';
            }
            return null;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Price (AUD)',
          font: { family: 'DM Sans', weight: '600', size: 14 },
          color: '#fff'
        },
        grid: { display: false },
        ticks: {
          font: { family: 'DM Sans', size: 12 },
          autoSkip: true,
          maxTicksLimit: 8,
          color: '#D1D5DB'
        }
      },
      y: {
        display: false,
        min: 0,
        max: maxDensity * 1.2, // Add 20% padding to the top
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem', fontFamily: 'DM Sans', color: '#fff' }}>
        📈 Competitor Price Curve
      </h3>
      <div style={{ height: '200px' }}>
        <Line key={JSON.stringify(prices)} data={data} options={options} />
      </div>
    </div>
  );
}