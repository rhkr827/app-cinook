import { FC } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  labels: string[];
  data: number[];
}

interface ChartComponentProps {
  data: ChartData;
}

const ChartComponent: FC<ChartComponentProps> = ({ data }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chinook Database 통계',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '데이터 수',
        data: data.data,
        backgroundColor: [
          'rgba(100, 108, 255, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(100, 108, 255, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieData = {
    labels: data.labels,
    datasets: [
      {
        label: '비율',
        data: data.data,
        backgroundColor: [
          'rgba(100, 108, 255, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(100, 108, 255, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="chart-container">
      <h3>데이터 시각화</h3>
      
      <div className="chart-grid">
        <div className="chart-item">
          <h4>막대 차트</h4>
          <div className="chart-wrapper">
            <Bar data={chartData} options={{
              ...chartOptions,
              maintainAspectRatio: false,
              responsive: true,
              interaction: {
                intersect: false,
                mode: 'index' as const,
              },
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'top' as const,
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
        
        <div className="chart-item">
          <h4>원형 차트</h4>
          <div className="chart-wrapper">
            <Pie data={pieData} options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="chart-item">
          <h4>선형 차트</h4>
          <div className="chart-wrapper">
            <Line data={chartData} options={{
              ...chartOptions,
              maintainAspectRatio: false,
              responsive: true,
              interaction: {
                intersect: false,
                mode: 'index' as const,
              },
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'top' as const,
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartComponent