import { useEffect, useRef } from 'react';
import { TimeSeriesData } from '@shared/schema';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Register Chart.js components
Chart.register(...registerables);

interface ConsumptionChartProps {
  timeSeriesData: TimeSeriesData[];
  isLoading: boolean;
}

export default function ConsumptionChart({ 
  timeSeriesData,
  isLoading,
}: ConsumptionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || !timeSeriesData.length) return;
    
    // Format labels always by hour:minute
    const formatTimeLabel = (timestamp: string) => {
      const zonedDate = toZonedTime(new Date(timestamp), 'America/Sao_Paulo');
      return format(zonedDate, 'HH:mm');
    };

    // 1. Find min and max timestamps
    const timestamps = timeSeriesData.map(item => new Date(item.timestamp));
    const minDate = new Date(Math.min(...timestamps.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...timestamps.map(d => d.getTime())));

    // 2. Generate all minute intervals between min and max
    const minuteIntervals: string[] = [];
    let current = new Date(minDate);
    while (current <= maxDate) {
      minuteIntervals.push(current.toISOString());
      current = new Date(current.getTime() + 60 * 1000); // add 1 minute
    }

    // 3. Map counts to each minute, fill missing with 0, and sum counts for each minute
    const timeSeriesMap = new Map<string, number>();
    for (const item of timeSeriesData) {
      const key = format(new Date(item.timestamp), "yyyy-MM-dd'T'HH:mm");
      timeSeriesMap.set(key, (timeSeriesMap.get(key) || 0) + item.count);
    }
    const labels = minuteIntervals.map(ts => formatTimeLabel(ts));
    const data = minuteIntervals.map(ts => {
      const key = format(new Date(ts), "yyyy-MM-dd'T'HH:mm");
      return timeSeriesMap.get(key) || 0;
    });

    // 4. Calculate cumulative sum for each point
    const cumulativeData = [];
    let runningTotal = 0;
    for (const count of data) {
      runningTotal += count;
      cumulativeData.push(runningTotal);
    }

    // Debug: log the chart data
    console.log('labels', labels);
    console.log('data', data);
    console.log('cumulativeData', cumulativeData);
    
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
              },
              autoSkip: false,
              maxRotation: 60,
              minRotation: 45,
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
  }, [timeSeriesData]);
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-barrel-brown mb-8">
      <div className="px-6 py-4 bg-barrel-brown flex justify-between items-center">
        <h2 className="text-2xl font-bungee text-white">Consumption Over Time</h2>
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
