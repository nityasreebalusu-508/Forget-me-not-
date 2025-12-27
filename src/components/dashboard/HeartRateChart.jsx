import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { Activity, AlertTriangle, Trash2, Edit2, X, TrendingUp, Calendar } from 'lucide-react';

const HeartRateChart = ({ data, onDelete, onEdit }) => {
    const { t } = useLanguage();
    const [viewPeriod, setViewPeriod] = useState('today');
    const [dismissedAlert, setDismissedAlert] = useState(false);
    const [selectedBarIndex, setSelectedBarIndex] = useState(null);

    // Helper function to classify heart rate
    const classifyHeartRate = (bpm) => {
        if (bpm < 60) {
            return {
                label: t.bradycardia || 'Bradycardia',
                color: 'bg-danger/20 text-danger border-danger/30',
                description: t.slowerThanNormal || 'Slower than normal',
                needsAttention: true
            };
        } else if (bpm >= 60 && bpm <= 100) {
            return {
                label: t.normal || 'Normal',
                color: 'bg-success/20 text-success border-success/30',
                description: t.healthyRange || 'Healthy range',
                needsAttention: false
            };
        } else if (bpm > 100) {
            return {
                label: t.tachycardia || 'Tachycardia',
                color: 'bg-danger/20 text-danger border-danger/30',
                description: t.fasterThanNormal || 'Faster than normal',
                needsAttention: true
            };
        }
        return {
            label: 'No Data',
            color: 'bg-gray-200 text-gray-500 border-gray-300',
            description: 'No heart rate data',
            needsAttention: false
        };
    };

    // Filter and aggregate data based on selected period
    const { chartData, periodReadings, hasAbnormalReadings } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], periodReadings: [], hasAbnormalReadings: false };

        const now = new Date();
        let filteredData = [];

        if (viewPeriod === 'today') {
            const today = now.toDateString();
            filteredData = data.filter(entry => new Date(entry.timestamp).toDateString() === today);
        } else if (viewPeriod === 'weekly') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredData = data.filter(entry => new Date(entry.timestamp) >= weekAgo);
        } else if (viewPeriod === 'monthly') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filteredData = data.filter(entry => new Date(entry.timestamp) >= monthAgo);
        }

        // Check for abnormal readings
        const abnormal = filteredData.some(entry => {
            const classification = classifyHeartRate(entry.bpm);
            return classification.needsAttention;
        });

        // Aggregate data for chart
        let aggregated = [];
        if (viewPeriod === 'today') {
            // Show individual readings for today (limit to 15 for better visibility)
            aggregated = filteredData.slice(-15).map(entry => ({
                name: entry.time.substring(0, 5),
                bpm: entry.bpm,
                date: entry.date,
                originalData: entry
            }));
        } else if (viewPeriod === 'weekly') {
            // Group by day and calculate average
            const dayGroups = {};
            filteredData.forEach(entry => {
                const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!dayGroups[date]) {
                    dayGroups[date] = [];
                }
                dayGroups[date].push(entry.bpm);
            });

            aggregated = Object.entries(dayGroups).map(([date, bpms]) => ({
                name: date,
                bpm: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
                count: bpms.length
            }));
        } else if (viewPeriod === 'monthly') {
            // Group by week and calculate average
            const weekGroups = {};
            filteredData.forEach(entry => {
                const entryDate = new Date(entry.timestamp);
                const weekStart = new Date(entryDate);
                weekStart.setDate(entryDate.getDate() - entryDate.getDay());
                const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                if (!weekGroups[weekLabel]) {
                    weekGroups[weekLabel] = [];
                }
                weekGroups[weekLabel].push(entry.bpm);
            });

            aggregated = Object.entries(weekGroups).map(([week, bpms]) => ({
                name: week,
                bpm: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
                count: bpms.length
            }));
        }

        return {
            chartData: aggregated,
            periodReadings: filteredData.slice(-5).reverse(),
            hasAbnormalReadings: abnormal
        };
    }, [data, viewPeriod]);

    // Reset dismissed alert when period changes or when new abnormal readings are detected
    useEffect(() => {
        setDismissedAlert(false);
    }, [viewPeriod, hasAbnormalReadings]);

    const stats = useMemo(() => {
        if (!data || data.length === 0) return {
            monthlyAvg: 0,
            weeklyData: [],
            minBpm: 0,
            maxBpm: 0,
            totalReadings: 0
        };

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Monthly Average and Range
        const monthlyReadings = data.filter(e => new Date(e.timestamp) >= thirtyDaysAgo);
        const monthlyAvg = monthlyReadings.length > 0
            ? Math.round(monthlyReadings.reduce((sum, e) => sum + e.bpm, 0) / monthlyReadings.length)
            : 0;

        const monthlyBpms = monthlyReadings.map(e => e.bpm);
        const minBpm = monthlyBpms.length > 0 ? Math.min(...monthlyBpms) : 0;
        const maxBpm = monthlyBpms.length > 0 ? Math.max(...monthlyBpms) : 0;

        // Weekly Data (Last 7 days including today)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayDate = d.getDate();
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });

            const dailyReadings = data.filter(e => {
                const entryDate = new Date(e.timestamp);
                return entryDate.getDate() === d.getDate() &&
                    entryDate.getMonth() === d.getMonth() &&
                    entryDate.getFullYear() === d.getFullYear();
            });

            const avg = dailyReadings.length > 0
                ? Math.round(dailyReadings.reduce((sum, e) => sum + e.bpm, 0) / dailyReadings.length)
                : 0;

            weeklyData.push({
                day: dayLabel,
                date: dayDate,
                month: monthLabel,
                avg: avg,
                count: dailyReadings.length,
                fullDate: dateStr
            });
        }

        return {
            monthlyAvg,
            weeklyData,
            minBpm,
            maxBpm,
            totalReadings: data.length
        };
    }, [data]);

    // Calculate dynamic max BPM for bar chart scaling
    const calculateBarMaxBpm = useMemo(() => {
        if (stats.weeklyData.length === 0) return 100;
        const maxWeeklyBpm = Math.max(...stats.weeklyData.map(day => day.avg));
        // Add 20% buffer or minimum of 100
        return Math.max(maxWeeklyBpm * 1.2, 100);
    }, [stats.weeklyData]);

    const handleBarClick = (index) => {
        if (stats.weeklyData[index].avg > 0) {
            setSelectedBarIndex(selectedBarIndex === index ? null : index);
        }
    };

    if (!data || data.length === 0) {
        return (
            <Card className="min-h-[400px] p-8 flex items-center justify-center text-text-muted">
                <div className="text-center space-y-4">
                    <Activity size={56} className="mx-auto opacity-40" />
                    <p className="text-lg">{t.noHeartRate || 'No heart rate data available'}</p>
                    <p className="text-sm text-text-muted/70">{t.noHeartRateAnalyticsMessage || 'Add your first heart rate reading to see analytics'}</p>
                </div>
            </Card>
        );
    }

    const viewLabels = {
        today: t.today || 'Today',
        weekly: t.weekly || 'Weekly',
        monthly: t.monthly || 'Monthly'
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Average Card */}
                <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={18} className="text-primary" />
                                <p className="text-sm font-medium text-text-main">{t.monthlyAverage || 'Monthly Average'}</p>
                            </div>
                            <p className="text-xs text-text-muted">Last 30 days</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${stats.monthlyAvg >= 60 && stats.monthlyAvg <= 100
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-danger/20 text-danger border border-danger/30'
                            }`}>
                            {stats.monthlyAvg >= 60 && stats.monthlyAvg <= 100 ? (t.normal || 'Normal') : (t.check || 'Check')}
                        </div>
                    </div>

                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-5xl font-bold text-text-main">{stats.monthlyAvg}</span>
                        <span className="text-lg text-text-muted">BPM</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                            <p className="text-xs text-text-muted mb-1">Min</p>
                            <p className="text-xl font-semibold text-text-main">{stats.minBpm}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-text-muted mb-1">Max</p>
                            <p className="text-xl font-semibold text-text-main">{stats.maxBpm}</p>
                        </div>
                    </div>
                </Card>

                {/* Weekly Overview Bar Chart */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            <p className="text-sm font-medium text-text-main">{t.weeklyOverview || 'Weekly Overview'}</p>
                        </div>
                        <p className="text-xs text-text-muted">Last 7 days</p>
                    </div>

                    <div className="flex items-end justify-between gap-1 h-32 mb-2">
                        {stats.weeklyData.map((day, index) => {
                            const heightPct = day.avg > 0
                                ? Math.min((day.avg / calculateBarMaxBpm) * 100, 100)
                                : 2;
                            const isAbnormal = day.avg > 0 && (day.avg < 60 || day.avg > 100);
                            const isSelected = selectedBarIndex === index;
                            const hasData = day.avg > 0;

                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center gap-3 group cursor-pointer"
                                    onClick={() => handleBarClick(index)}
                                >
                                    <div className="relative w-full flex justify-center h-full items-end">
                                        {/* Bar Value Tooltip */}
                                        {hasData && (
                                            <div className={`absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg ${isSelected ? 'opacity-100' : ''}`}>
                                                <div className="font-semibold">{day.avg} BPM</div>
                                                {day.count > 0 && (
                                                    <div className="text-gray-300 text-[10px] mt-0.5">
                                                        {day.count} reading{day.count !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bar */}
                                        <div
                                            className={`w-full max-w-[22px] rounded-t-lg transition-all duration-300 ${!hasData ? 'bg-gray-300/30' :
                                                isAbnormal ? 'bg-danger' : 'bg-success'
                                                } ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''} ${hasData ? 'hover:opacity-90 cursor-pointer' : 'cursor-default'}`}
                                            style={{
                                                height: `${heightPct}%`,
                                                minHeight: hasData ? '8px' : '2px'
                                            }}
                                        />

                                        {/* Normal Range Indicator Line */}
                                        {hasData && (
                                            <div
                                                className="absolute w-full h-[1px] bg-primary/40 z-0"
                                                style={{ bottom: `${(60 / calculateBarMaxBpm) * 100}%` }}
                                            />
                                        )}
                                    </div>

                                    {/* Day Labels */}
                                    <div className="text-center">
                                        <span className="block text-xs font-semibold text-text-main uppercase tracking-tight">
                                            {day.day}
                                        </span>
                                        <span className="block text-xs text-text-muted mt-1">
                                            {day.month} {day.date}
                                        </span>
                                        {hasData ? (
                                            <div className={`text-[10px] font-medium mt-1 ${isAbnormal ? 'text-danger' : 'text-success'}`}>
                                                {day.avg}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-medium mt-1 text-text-muted">-</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-success"></div>
                            <span className="text-xs text-text-muted">Normal (60-100 BPM)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-danger"></div>
                            <span className="text-xs text-text-muted">Abnormal</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Health Alert Banner */}
            {hasAbnormalReadings && !dismissedAlert && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-5 flex items-start gap-4 animate-fade-in relative">
                    <AlertTriangle size={24} className="text-danger mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1 pr-10">
                        <h4 className="font-semibold text-danger">{t.cautionHeartHealth || 'Caution – Heart Health'}</h4>
                        <p className="text-sm text-text-muted leading-relaxed">
                            {t.abnormalHeartRateMsg || 'Some readings show abnormal heart rate. Consider consulting a healthcare professional if this persists.'}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                onClick={() => {
                                    // Logic to filter to show only abnormal readings
                                    const abnormalReadings = data.filter(entry => {
                                        const classification = classifyHeartRate(entry.bpm);
                                        return classification.needsAttention;
                                    });
                                    console.log('Abnormal readings:', abnormalReadings);
                                    // You could set state to show these or filter the main view
                                }}
                                className="text-xs text-danger hover:text-danger/80 font-medium underline underline-offset-2"
                            >
                                Show abnormal readings
                            </button>
                            <button
                                onClick={() => {
                                    // Reset to normal range
                                    setViewPeriod('today');
                                }}
                                className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                            >
                                View recent data
                            </button>
                        </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={() => setDismissedAlert(true)}
                        className="absolute top-3 right-3 p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title={t.dismiss || "Dismiss"}
                        aria-label={t.dismiss || "Dismiss alert"}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Chart Section */}
            <Card className="h-96 w-full p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                        <h3 className="text-xl font-semibold flex items-center gap-3 text-text-main">
                            <Activity size={22} className="text-primary" />
                            {t.recentReadings || 'Recent Readings'}
                        </h3>

                        {/* Average BPM Display */}
                        {chartData.length > 0 && (() => {
                            const avgBpm = Math.round(
                                chartData.reduce((sum, item) => sum + item.bpm, 0) / chartData.length
                            );
                            const isNormal = avgBpm >= 60 && avgBpm <= 100;

                            return (
                                <div className={`flex items-baseline gap-2 px-4 py-2 rounded-lg border ${isNormal
                                    ? 'bg-success/10 text-success border-success/30'
                                    : 'bg-danger/10 text-danger border-danger/30'
                                    }`}>
                                    <span className="text-sm font-medium">{t.avg || 'Avg'}:</span>
                                    <span className="text-xl font-bold ml-1">{avgBpm}</span>
                                    <span className="text-sm ml-1">{t.bpm || 'BPM'}</span>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Period Toggle */}
                    <div className="flex items-center gap-1 bg-bg-primary p-1 rounded-lg">
                        {['today', 'weekly', 'monthly'].map(period => (
                            <button
                                key={period}
                                onClick={() => setViewPeriod(period)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewPeriod === period
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-muted hover:text-text-main hover:bg-bg-card'
                                    }`}
                            >
                                {viewLabels[period]}
                            </button>
                        ))}
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted p-8">
                        <Calendar size={48} className="opacity-40 mb-4" />
                        <p className="text-lg mb-2">{t.noDataForPeriod || 'No data for this period'}</p>
                        <p className="text-sm text-text-muted/70">Try selecting a different time period</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickLine={{ stroke: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickLine={{ stroke: '#94a3b8' }}
                                domain={['dataMin - 10', 'dataMax + 10']}
                                label={{
                                    value: 'BPM',
                                    angle: -90,
                                    position: 'insideLeft',
                                    fill: '#94a3b8',
                                    fontSize: 12
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                    borderRadius: '10px',
                                    color: '#f8fafc',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}
                                labelFormatter={(label) => `Time: ${label}`}
                                formatter={(value, name, props) => {
                                    const classification = classifyHeartRate(value);
                                    const items = [
                                        [`${value} BPM`, viewPeriod === 'today' ? (t.heartRate || 'Heart Rate') : (t.avgHeartRate || 'Avg Heart Rate')]
                                    ];

                                    if (props.payload?.count) {
                                        items.push([`${props.payload.count} readings`, 'Data Points']);
                                    }

                                    return items;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="bpm"
                                stroke="#ec4899"
                                strokeWidth={3}
                                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 8, strokeWidth: 2, stroke: '#ffffff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* History Section */}
            <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-semibold text-text-main">History</h3>
                    <p className="text-sm text-text-muted">{periodReadings.length} recent entries</p>
                </div>
                <div className="space-y-4">
                    {periodReadings.length === 0 ? (
                        <Card className="p-8 text-center text-text-muted">
                            <p>No readings in this period</p>
                        </Card>
                    ) : (
                        periodReadings.map((reading, index) => {
                            const classification = classifyHeartRate(reading.bpm);
                            return (
                                <Card key={index} className="p-5 hover:border-primary/30 transition-colors group hover:shadow-sm">
                                    <div className="flex items-center justify-between">
                                        {/* Left: Badge and BPM */}
                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${classification.color} ${classification.needsAttention ? 'animate-pulse' : ''}`}>
                                                {classification.label}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-text-main">{reading.bpm}</span>
                                                    <span className="text-sm text-text-muted">BPM</span>
                                                </div>
                                                <p className="text-xs text-text-muted">
                                                    {classification.needsAttention ? (
                                                        <span className="flex items-center gap-1 text-danger font-medium">
                                                            <AlertTriangle size={10} />
                                                            {t.needsAttention || 'Needs Attention'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-success">{classification.description}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Timing and Actions */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right space-y-1">
                                                <p className="text-sm font-medium text-text-main">{reading.time}</p>
                                                <p className="text-xs text-text-muted">{formatDate(reading.timestamp)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(reading)}
                                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                        title={t.edit || "Edit"}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(reading.id)}
                                                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                                                        title={t.delete || "Delete"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeartRateChart;