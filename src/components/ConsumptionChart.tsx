import { useEffect, useRef } from 'react';
import { TimeSeriesData } from '@shared/schema';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

interface ConsumptionChartProps {
  timeSeriesData: TimeSeriesData[];
  isLoading: boolean;
  timeRange: 'hour' | 'day' | 'all';
  onTimeRangeChange: (range: 'hour' | 'day' | 'all') => void;
}

export default function ConsumptionChart({ 
  timeSeriesData,
  isLoading,
  timeRange,
  onTimeRangeChange
}: ConsumptionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || !timeSeriesData.length) return;
    
    // Format labels based on time range
    const formatTimeLabel = (timestamp: string) => {
      const date = new Date(timestamp);
      switch(timeRange) {
        case 'hour':
          return format(date, 'HH:mm');
        case 'day':
          return format(date, 'HH:mm');
        case 'all':
        default:
          return format(date, 'MM/dd HH:mm');
      }
    };
    
    const labels = timeSeriesData.map(item => formatTimeLabel(item.timestamp));
    const data = timeSeriesData.map(item => item.count);
    
    // Calculate cumulative sum for each point
    const cumulativeData = [];
    let runningTotal = 0;
    for (const item of timeSeriesData) {
      runningTotal += item.count;
      cumulativeData.push(runningTotal);
    }
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Beers Consumed',
            data,
            borderColor: '#E6A817',
            backgroundColor: 'rgba(230, 168, 23, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Cumulative Total',
            data: cumulativeData,
            borderColor: '#8B5A2B',
            backgroundColor: 'rgba(139, 90, 43, 0.1)',
            fill: false,
            tension: 0.1,
            borderDash: [5, 5],
            pointRadius: 0,
            yAxisID: 'y',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            backgroundColor: '#8B5A2B',
            titleFont: {
              family: '"Roboto", sans-serif',
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: '"Roboto", sans-serif',
              size: 13
            },
            callbacks: {
              label: function(context) {
                if (context.dataset.label === 'Cumulative Total') {
                  return `${context.parsed.y} total beers`;
                }
                return `${context.parsed.y} beers consumed`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(139, 90, 43, 0.1)'
            },
            ticks: {
              font: {
                family: '"Roboto", sans-serif'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(139, 90, 43, 0.1)'
            },
            ticks: {
              font: {
                family: '"Roboto", sans-serif'
              },
              callback: function(value) {
                return value + ' 🍺';
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear'
          }
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [timeSeriesData, timeRange]);
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-barrel-brown mb-8">
      <div className="px-6 py-4 bg-barrel-brown flex justify-between items-center">
        <h2 className="text-2xl font-bungee text-white">Consumption Over Time</h2>
        <select 
          className="bg-barrel-light text-barrel-dark rounded px-3 py-1 text-sm"
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as 'hour' | 'day' | 'all')}
        >
          <option value="hour">Last Hour</option>
          <option value="day">Today</option>
          <option value="all">All Time</option>
        </select>
      </div>
      
      <div className="p-4">
        <div className="h-64 relative">
          {/* Chart */}
          <canvas ref={chartRef} />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="text-center">
                <div className="inline-block animate-spin mb-2">
                  <i className="ri-loader-4-line text-3xl text-beer-amber"></i>
                </div>
                <p className="text-barrel-light">Loading chart data...</p>
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && timeSeriesData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <i className="ri-bar-chart-grouped-line text-5xl text-beer-amber mb-2"></i>
                <p className="text-barrel-light">No consumption data available for this time period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
