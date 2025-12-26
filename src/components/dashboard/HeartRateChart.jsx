import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

const HeartRateChart = ({ data }) => {
    const { t } = useLanguage();
    const [viewPeriod, setViewPeriod] = useState('today'); // 'today', 'weekly', 'monthly'

    // Helper function to classify heart rate
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
            // Show individual readings for today
            aggregated = filteredData.slice(-10).map(entry => ({
                name: entry.time.substring(0, 5),
                bpm: entry.bpm,
                date: entry.date
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
                bpm: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length)
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
                bpm: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length)
            }));
        }

        return {
            chartData: aggregated,
            periodReadings: filteredData.slice(-5).reverse(),
            hasAbnormalReadings: abnormal
        };
    }, [data, viewPeriod]);

    if (!data || data.length === 0) {
        return (
            <Card className="h-96 flex items-center justify-center text-text-muted">
                <div className="text-center">
                    <Activity size={48} className="mx-auto mb-4 opacity-40" />
                    <p>{t.noHeartRate}</p>
                </div>
            </Card>
        );
    }

    const viewLabels = {
        today: t.today || 'Today',
        weekly: t.weekly || 'Weekly',
        monthly: t.monthly || 'Monthly'
    };

    return (
        <div className="space-y-6">
            {/* Health Alert Banner */}
            {hasAbnormalReadings && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertTriangle size={20} className="text-danger mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-danger mb-1">{t.cautionHeartHealth || 'Caution – Heart Health'}</h4>
                        <p className="text-sm text-text-muted">
                            {t.abnormalHeartRateMsg || 'Some readings show abnormal heart rate. Consider consulting a healthcare professional if this persists.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Chart Section */}
            <Card className="h-96 w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-text-main">
                            <Activity size={20} className="text-primary" />
                            {t.recentReadings || 'Recent Readings'}
                        </h3>

                        {/* Average BPM Display */}
                        {chartData.length > 0 && (() => {
                            const avgBpm = Math.round(
                                chartData.reduce((sum, item) => sum + item.bpm, 0) / chartData.length
                            );
                            const isNormal = avgBpm >= 60 && avgBpm <= 100;

                            return (
                                <div className={`flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg ${isNormal
                                    ? 'bg-success/20 text-success'
                                    : 'bg-danger/20 text-danger'
                                    }`}>
                                    <span className="text-xs font-medium">{t.avg || 'Avg'}:</span>
                                    <span className="text-lg font-bold">{avgBpm}</span>
                                    <span className="text-xs">{t.bpm || 'BPM'}</span>
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
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewPeriod === period
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
                    <div className="h-full flex items-center justify-center text-text-muted">
                        <p>{t.noDataForPeriod || 'No data for this period'}</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickLine={{ stroke: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickLine={{ stroke: '#94a3b8' }}
                                domain={['dataMin - 10', 'dataMax + 10']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    borderColor: 'rgba(148, 163, 184, 0.2)',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                formatter={(value) => [`${value} ${t.bpm || 'BPM'}`, viewPeriod === 'today' ? (t.heartRate || 'Heart Rate') : (t.avgHeartRate || 'Avg Heart Rate')]}
                            />
                            <Line
                                type="monotone"
                                dataKey="bpm"
                                stroke="#ec4899"
                                strokeWidth={3}
                                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* History Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-text-main">History</h3>
                <div className="space-y-2">
                    {periodReadings.map((reading, index) => {
                        const classification = classifyHeartRate(reading.bpm);
                        return (
                            <Card key={index} className="p-4 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    {/* Left: Badge and BPM */}
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${classification.color}`}>
                                            {classification.label}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-text-main">{reading.bpm}</span>
                                                <span className="text-sm text-text-muted">BPM</span>
                                            </div>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {classification.needsAttention ? (
                                                    <span className="text-danger font-medium">{t.needsAttention || 'Needs Attention'}</span>
                                                ) : (
                                                    classification.description
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Timing */}
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-text-main">{reading.time}</p>
                                        <p className="text-xs text-text-muted">{reading.date}</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HeartRateChart;
