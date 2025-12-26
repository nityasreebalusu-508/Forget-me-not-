


import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import { Heart, Pill, TrendingUp } from 'lucide-react';

const StatsOverview = ({ heartRateHistory, medications }) => {
    const { t } = useLanguage();

    const getLatestHeartRate = () => {
        if (heartRateHistory.length === 0) return 0;
        return heartRateHistory[heartRateHistory.length - 1].bpm;
    };

    const getTodaysMedicationsCount = () => {
        // Basic logic: count medications scheduled for today (assuming all are daily for MVP)
        return medications.length;
    };

    const getWeeklyAdherence = () => {
        if (medications.length === 0) return 100;

        let takenCount = 0;
        let missedCount = 0;

        medications.forEach(med => {
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toDateString();

                // Check if record exists for this date
                const record = med.records?.find(r => new Date(r.date).toDateString() === dateString);

                if (record?.taken) {
                    takenCount++;
                } else {
                    missedCount++;
                }
            }
        });

        const total = takenCount + missedCount;
        if (total === 0) return 0;
        return Math.round((takenCount / total) * 100);
    };

    const adherence = getWeeklyAdherence();
    const adherenceColor = adherence >= 80 ? 'text-success' : adherence >= 50 ? 'text-warning' : 'text-danger';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="flex items-center gap-4 border-l-4 border-l-secondary bg-gradient-to-r from-bg-card to-secondary/5">
                <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                    <Heart size={24} />
                </div>
                <div>
                    <p className="text-sm text-text-muted">{t.latestHeartRate}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold">{getLatestHeartRate()}</h3>
                        <span className="text-sm text-text-muted">BPM</span>
                    </div>
                </div>
            </Card>

            <Card className="flex flex-col gap-4 border-l-4 border-l-primary bg-gradient-to-r from-bg-card to-primary/5 h-full relative overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/20 text-text-main flex-shrink-0">
                        <Pill size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold tracking-wider">{t.todaysMedications}</p>
                        <p className="text-sm text-text-muted mt-0.5">{medications.length} {t.scheduled || 'Scheduled'}</p>
                    </div>
                </div>

                <div className="flex-1 mt-2 space-y-2 overflow-y-auto max-h-[120px] pr-1 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
                    {medications.length === 0 ? (
                        <p className="text-sm text-text-muted italic">{t.noMedicationsScheduled || 'No medications scheduled'}</p>
                    ) : (
                        medications.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-bg-primary/50 border border-border hover:border-primary/30 transition-colors">
                                <span className="font-medium text-text-main truncate pr-2">{med.name}</span>
                                <span className="text-xs font-mono bg-bg-card px-1.5 py-0.5 rounded text-text-muted border border-border">
                                    {med.time ? new Date(`2000-01-01T${med.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Card className="flex items-center gap-4 border-l-4 border-l-success bg-gradient-to-r from-bg-card to-success/5">
                <div className="p-3 rounded-full bg-success/20 text-success">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-sm text-text-muted">{t.weeklyAdherence || 'Weekly Adherence'}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-3xl font-bold ${adherenceColor}`}>{adherence}%</h3>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StatsOverview;
