import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import { Heart, Pill, AlertCircle } from 'lucide-react';

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

    const getMissedMedicationsCount = () => {
        let missed = 0;
        const today = new Date().toDateString();

        medications.forEach(med => {
            const todayRecord = med.records?.find(r =>
                new Date(r.date).toDateString() === today
            );
            if (todayRecord && !todayRecord.taken) missed++;
        });

        return missed;
    };

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

            <Card className="flex items-center gap-4 border-l-4 border-l-primary bg-gradient-to-r from-bg-card to-primary/5">
                <div className="p-3 rounded-full bg-primary/20 text-text-main">
                    <Pill size={24} />
                </div>
                <div>
                    <p className="text-sm text-text-muted">{t.todaysMedications}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold">{getTodaysMedicationsCount()}</h3>
                        <span className="text-sm text-text-muted">{t.scheduled || 'Scheduled'}</span>
                    </div>
                </div>
            </Card>

            <Card className="flex items-center gap-4 border-l-4 border-l-warning bg-gradient-to-r from-bg-card to-warning/5">
                <div className="p-3 rounded-full bg-warning/20 text-warning">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-text-muted">{t.adherence || 'Adherence'}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-warning">{getMissedMedicationsCount()}</h3>
                        <span className="text-sm text-text-muted">{t.missed}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StatsOverview;
