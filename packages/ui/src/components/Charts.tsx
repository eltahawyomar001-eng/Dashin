'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesData, PieChartSegment } from '@dashin/shared-types';

/**
 * Default color palette for charts
 */
const CHART_COLORS = [
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

/**
 * Custom tooltip component
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, formatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      )}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Line Chart Component
 */
export interface LineChartProps {
  data: TimeSeriesData[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatter?: (value: number) => string;
  colors?: string[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  formatter,
  colors = CHART_COLORS,
}) => {
  // Transform data for recharts format
  const chartData = data[0]?.data.map((point: any, index: number) => {
    const dataPoint: any = { timestamp: point.label || new Date(point.timestamp).toLocaleDateString() };
    data.forEach((series) => {
      dataPoint[series.name] = series.data[index]?.value || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey="timestamp"
          stroke="#9ca3af"
          fontSize={12}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {data.map((series, index) => (
          <Line
            key={series.id}
            type="monotone"
            dataKey={series.name}
            stroke={series.color || colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

/**
 * Area Chart Component
 */
export interface AreaChartProps {
  data: TimeSeriesData[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatter?: (value: number) => string;
  colors?: string[];
  stacked?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  formatter,
  colors = CHART_COLORS,
  stacked = false,
}) => {
  // Transform data for recharts format
  const chartData = data[0]?.data.map((point: any, index: number) => {
    const dataPoint: any = { timestamp: point.label || new Date(point.timestamp).toLocaleDateString() };
    data.forEach((series) => {
      dataPoint[series.name] = series.data[index]?.value || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey="timestamp"
          stroke="#9ca3af"
          fontSize={12}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {data.map((series, index) => (
          <Area
            key={series.id}
            type="monotone"
            dataKey={series.name}
            stroke={series.color || colors[index % colors.length]}
            fill={series.color || colors[index % colors.length]}
            fillOpacity={0.6}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Bar Chart Component
 */
export interface BarChartProps {
  data: TimeSeriesData[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatter?: (value: number) => string;
  colors?: string[];
  stacked?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  formatter,
  colors = CHART_COLORS,
  stacked = false,
}) => {
  // Transform data for recharts format
  const chartData = data[0]?.data.map((point: any, index: number) => {
    const dataPoint: any = { timestamp: point.label || new Date(point.timestamp).toLocaleDateString() };
    data.forEach((series) => {
      dataPoint[series.name] = series.data[index]?.value || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey="timestamp"
          stroke="#9ca3af"
          fontSize={12}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {data.map((series, index) => (
          <Bar
            key={series.id}
            dataKey={series.name}
            fill={series.color || colors[index % colors.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

/**
 * Pie Chart Component
 */
export interface PieChartProps {
  data: PieChartSegment[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  colors = CHART_COLORS,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={innerRadius}
          label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
          labelLine={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        {showLegend && <Legend />}
        <Tooltip
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const data = payload[0].payload as PieChartSegment;
            return (
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.color || colors[0] }}
                  />
                  <span className="text-gray-600">{data.name}:</span>
                  <span className="font-semibold text-gray-900">
                    {data.value} ({data.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

/**
 * Donut Chart Component (Pie chart with inner radius)
 */
export interface DonutChartProps extends PieChartProps {}

export const DonutChart: React.FC<DonutChartProps> = (props) => {
  return <PieChart {...props} innerRadius={60} />;
};
