import { useEffect, useRef } from 'react';
import { TimeSeriesData } from '@shared/schema';
import { Chart, registerables } from 'chart.js';
import { format, addMinutes, isBefore, startOfMinute } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Register Chart.js components
Chart.register(...registerables);

interface ConsumptionChartProps {
  timeSeriesData: TimeSeriesData[];
  isLoading: boolean;
}

function get5MinGroup(date: Date) {
  const minutes = date.getMinutes();
  const floored = minutes - (minutes % 5);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), floored, 0, 0);
}

export default function ConsumptionChart({ 
  timeSeriesData,
  isLoading,
}: ConsumptionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || !timeSeriesData.length) return;
    
    // 1. Find min and max timestamps
    const timestamps = timeSeriesData.map(item => new Date(item.timestamp));
    const minDate = get5MinGroup(new Date(Math.min(...timestamps.map(d => d.getTime()))));
    const maxDate = get5MinGroup(new Date(Math.max(...timestamps.map(d => d.getTime()))));

    // 2. Generate all 5-minute intervals between min and max
    const intervals: Date[] = [];
    let current = minDate;
    while (!isBefore(maxDate, current)) {
      intervals.push(new Date(current));
      current = addMinutes(current, 5);
    }

    // 3. Map counts to each 5-minute interval
    const timeSeriesMap = new Map<string, number>();
    for (const item of timeSeriesData) {
      const group = get5MinGroup(new Date(item.timestamp));
      const key = group.toISOString();
      timeSeriesMap.set(key, (timeSeriesMap.get(key) || 0) + item.count);
    }
    const labels = intervals.map(ts => format(toZonedTime(ts, 'America/Sao_Paulo'), 'HH:mm'));
    const data = intervals.map(ts => {
      const key = ts.toISOString();
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
            tension: 0.3,
            yAxisID: 'y',
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
            yAxisID: 'y1',
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
            position: 'left',
            title: {
              display: true,
              text: 'Beers Drunk',
              color: '#E6A817',
              font: { family: '"Roboto", sans-serif', weight: 'bold', size: 14 }
            },
            grid: {
              color: 'rgba(139, 90, 43, 0.1)'
            },
            ticks: {
              font: {
                family: '"Roboto", sans-serif'
              },
              color: '#E6A817',
              callback: function(value) {
                return value + ' 🍺';
              }
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cumulative Total',
              color: '#8B5A2B',
              font: { family: '"Roboto", sans-serif', weight: 'bold', size: 14 }
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              font: {
                family: '"Roboto", sans-serif'
              },
              color: '#8B5A2B',
              callback: function(value) {
                return value;
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
        <div className="h-[450px] relative">
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