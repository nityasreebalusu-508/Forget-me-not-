import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

const HeartRateChart = ({ data }) => {
    const { t } = useLanguage();

    // Helper function to classify heart rate
    const classifyHeartRate = (bpm) => {
        if (bpm < 60) {
            return {
                label: 'Bradycardia',
                color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                description: 'Slower than normal'
            };
        } else if (bpm >= 60 && bpm <= 100) {
            return {
                label: 'Normal',
                color: 'bg-success/20 text-success border-success/30',
                description: 'Healthy range'
            };
        } else if (bpm > 100) {
            return {
                label: 'Tachycardia',
                color: 'bg-danger/20 text-danger border-danger/30',
                description: 'Faster than normal'
            };
        }
    };

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

    // Format data for chart (take last 10 readings for cleanliness)
    const chartData = data.slice(-10).map(entry => ({
        name: entry.time.substring(0, 5), // HH:MM
        bpm: entry.bpm,
        date: entry.date
    }));

    // Get recent readings (last 5) for history section
    const recentReadings = [...data].reverse().slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Chart Section */}
            <Card className="h-96 w-full">
                <h3 className="mb-6 text-xl font-semibold flex items-center gap-2 text-text-main">
                    <Activity size={20} className="text-primary" />
                    Recent Readings
                </h3>
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
            </Card>

            {/* History Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-text-main">History</h3>
                <div className="space-y-2">
                    {recentReadings.map((reading, index) => {
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
                                            <p className="text-xs text-text-muted mt-0.5">{classification.description}</p>
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
