import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Check, Trash2, Clock, Pill, X, ChevronLeft, ChevronRight, Calendar, Bell, BellOff, TrendingUp, AlertCircle } from 'lucide-react';

const MedicationList = ({ medications, onAdd, onDelete, onTake, onUpdate }) => {
    const { t } = useLanguage();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        dose: '',
        time: '',
        mealType: 'breakfast',
        mealTiming: 'before'
    });
    const [editingId, setEditingId] = useState(null);

    // Check notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    // Request notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');

            if (permission === 'granted') {
                new Notification('Medication Reminders Enabled', {
                    body: 'You will receive reminders for your medications',
                    icon: '/favicon.ico'
                });
            }
        }
    };

    // Schedule notification for medication
    const scheduleNotification = (medication) => {
        if (!notificationsEnabled) return;

        const [hours, minutes] = medication.time.split(':');
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0);

        if (scheduledTime > now) {
            const timeUntil = scheduledTime - now;
            setTimeout(() => {
                new Notification(`Time for ${medication.name}`, {
                    body: `${medication.dose} - ${medication.timing}`,
                    icon: '/favicon.ico',
                    tag: medication.id
                });
            }, timeUntil);
        }
    };

    // Schedule notifications for all medications
    useEffect(() => {
        if (notificationsEnabled && medications.length > 0) {
            medications.forEach(scheduleNotification);
        }
    }, [notificationsEnabled, medications]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            onUpdate(editingId, newMed);
        } else {
            onAdd(newMed);
        }
        setNewMed({ name: '', dose: '', time: '', mealType: 'breakfast', mealTiming: 'before' });
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleCancel = () => {
        setNewMed({ name: '', dose: '', time: '', mealType: 'breakfast', mealTiming: 'before' });
        setIsFormOpen(false);
    };

    const handleEdit = (med) => {
        setNewMed({
            name: med.name,
            dose: med.dose,
            time: med.time,
            mealType: med.mealType || 'breakfast',
            mealTiming: med.mealTiming || 'before'
        });
        setEditingId(med.id);
        setIsFormOpen(true);
    };

    // Date navigation functions
    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isFutureDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate > today;
    };

    // Get medication status for selected date
    const getMedicationStatus = (med) => {
        const dateString = selectedDate.toDateString();
        const record = med.records?.find(r => new Date(r.date).toDateString() === dateString);

        if (record?.taken) {
            return { status: 'taken', label: t.taken || 'Taken', color: 'bg-success/20 text-success border-success/30' };
        }

        if (isFutureDate(selectedDate)) {
            return { status: 'pending', label: t.pending || 'Pending', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
        }

        if (!isToday(selectedDate)) {
            return { status: 'missed', label: t.missed || 'Missed', color: 'bg-danger/20 text-danger border-danger/30' };
        }

        return { status: 'pending', label: t.pending || 'Pending', color: 'bg-warning/20 text-warning border-warning/30' };
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        let takenToday = 0;
        let missedToday = 0;
        let weeklyData = Array(7).fill(0).map(() => ({ taken: 0, missed: 0 }));

        // Use mock data in development if no real data exists
        // Calculate stats based on actual medications
        const hasMedications = medications.length > 0;

        if (hasMedications) {
            medications.forEach(med => {
                // Today's stats
                const todayRecord = med.records?.find(r => new Date(r.date).toDateString() === today);
                if (todayRecord?.taken) {
                    takenToday++;
                } else {
                    missedToday++;
                }

                // Weekly stats
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateString = date.toDateString();
                    const record = med.records?.find(r => new Date(r.date).toDateString() === dateString);

                    if (record?.taken) {
                        weeklyData[6 - i].taken++;
                    } else if (date <= new Date()) {
                        weeklyData[6 - i].missed++;
                    }
                }
            });
        }

        return { takenToday, missedToday, weeklyData };
    }, [medications, selectedDate]);

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getMealLabel = (mealType, mealTiming) => {
        const mealLabels = {
            breakfast: t.breakfast || 'Breakfast',
            lunch: t.lunch || 'Lunch',
            dinner: t.dinner || 'Dinner'
        };
        const timingLabels = {
            before: t.beforeMeal || 'Before',
            after: t.afterMeal || 'After'
        };
        return `${timingLabels[mealTiming]} ${mealLabels[mealType]}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-text-main">{t.yourMedications}</h2>
                <div className="flex items-center gap-3">
                    {/* Notification Toggle */}
                    <button
                        onClick={requestNotificationPermission}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${notificationsEnabled
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-bg-primary text-text-muted border border-glass-border hover:border-primary'
                            }`}
                        title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
                    >
                        {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        <span className="text-sm font-medium hidden sm:inline">
                            {notificationsEnabled ? (t.remindersOn || 'Reminders On') : (t.enableReminders || 'Enable Reminders')}
                        </span>
                    </button>

                    {!isFormOpen && (
                        <Button onClick={() => setIsFormOpen(true)}>
                            <Plus size={18} /> {t.addMedication}
                        </Button>
                    )}
                </div>
            </div>

            {/* Visualization - Stats Dashboard */}
            {!isFormOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Taken Today */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted mb-1">{t.takenToday || 'Taken Today'}</p>
                                <p className="text-3xl font-bold text-success">{stats.takenToday}</p>
                            </div>
                            <div className="p-3 rounded-full bg-success/20">
                                <Check size={24} className="text-success" />
                            </div>
                        </div>
                    </Card>

                    {/* Missed Today */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted mb-1">{t.missedToday || 'Missed Today'}</p>
                                <p className="text-3xl font-bold text-danger">{stats.missedToday}</p>
                            </div>
                            <div className="p-3 rounded-full bg-danger/20">
                                <AlertCircle size={24} className="text-danger" />
                            </div>
                        </div>
                        {stats.missedToday > 0 && (
                            <p className="text-xs text-text-muted mt-2">
                                {t.missedDoseMessage || "Don't worry! You can still take it now."}
                            </p>
                        )}
                    </Card>

                    {/* Weekly Overview */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={16} className="text-primary" />
                            <p className="text-sm font-medium text-text-main">{t.weeklyOverview || 'Weekly Overview'}</p>
                        </div>
                        <div className="flex items-end justify-between gap-1 h-16">
                            {stats.weeklyData.map((day, index) => {
                                const total = day.taken + day.missed;
                                const percentage = total > 0 ? (day.taken / total) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full bg-bg-primary rounded-t relative" style={{ height: `${Math.max(percentage, 5)}%` }}>
                                            <div
                                                className="w-full bg-success rounded-t absolute bottom-0"
                                                style={{ height: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-text-muted">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Medication Form */}
            {isFormOpen && (
                <Card className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-text-main">{editingId ? (t.editMedication || 'Edit Medication') : t.addMedication}</h3>
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label={t.medicationName}
                            value={newMed.name}
                            onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                            placeholder="e.g., Aspirin"
                            required
                        />
                        <Input
                            label={t.dose}
                            value={newMed.dose}
                            onChange={e => setNewMed({ ...newMed, dose: e.target.value })}
                            placeholder="e.g., 100mg"
                            required
                        />
                        <Input
                            label={t.reminderTime || 'Reminder Time'}
                            type="time"
                            value={newMed.time}
                            onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                            required
                        />

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-muted">{t.mealType || 'Meal Type'}</label>
                            <select
                                className="glass-input p-3 rounded-lg w-full"
                                value={newMed.mealType}
                                onChange={e => setNewMed({ ...newMed, mealType: e.target.value })}
                            >
                                <option value="breakfast" className="bg-bg-card">{t.breakfast || 'Breakfast'}</option>
                                <option value="lunch" className="bg-bg-card">{t.lunch || 'Lunch'}</option>
                                <option value="dinner" className="bg-bg-card">{t.dinner || 'Dinner'}</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-muted">{t.timing || 'Timing'}</label>
                            <select
                                className="glass-input p-3 rounded-lg w-full"
                                value={newMed.mealTiming}
                                onChange={e => setNewMed({ ...newMed, mealTiming: e.target.value })}
                            >
                                <option value="before" className="bg-bg-card">{t.beforeMeal || 'Before Meal'}</option>
                                <option value="after" className="bg-bg-card">{t.afterMeal || 'After Meal'}</option>
                            </select>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                                {t.cancel}
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                {t.save}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Date Pagination */}
            {!isFormOpen && medications.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={goToPreviousDay}
                            className="p-2 rounded-lg hover:bg-bg-primary text-text-muted hover:text-text-main transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Calendar size={16} className="text-primary" />
                                <span className="text-sm font-semibold text-text-main">
                                    {formatDate(selectedDate)}
                                </span>
                            </div>
                            {isToday(selectedDate) && (
                                <span className="text-xs text-primary font-medium">{t.today || 'Today'}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {!isToday(selectedDate) && (
                                <button
                                    onClick={goToToday}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                                >
                                    {t.today || 'Today'}
                                </button>
                            )}
                            <button
                                onClick={goToNextDay}
                                className="p-2 rounded-lg hover:bg-bg-primary text-text-muted hover:text-text-main transition-colors"
                                disabled={isFutureDate(selectedDate)}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Medications List */}
            {medications.length === 0 && !isFormOpen ? (
                <Card className="text-center py-16">
                    <Pill size={56} className="mx-auto mb-4 text-text-muted opacity-40" />
                    <p className="text-text-muted text-lg">{t.noMedications}</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {medications.map(med => {
                        const status = getMedicationStatus(med);
                        const canTakeToday = isToday(selectedDate) && status.status !== 'taken';
                        const isMissed = status.status === 'missed';

                        return (
                            <div key={med.id}>
                                <Card className="p-4 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Status Badge and Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap ${status.color}`}>
                                                {status.label}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-text-main truncate">{med.name}</h3>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className="text-sm text-text-muted">{med.dose}</span>
                                                    <span className="text-xs text-text-muted">•</span>
                                                    <div className="flex items-center gap-1 text-sm text-text-muted">
                                                        <Clock size={12} />
                                                        <span>{med.time}</span>
                                                    </div>
                                                    <span className="text-xs text-text-muted">•</span>
                                                    <span className="text-xs text-text-muted">
                                                        {getMealLabel(med.mealType || 'breakfast', med.mealTiming || 'before')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-2">
                                            {canTakeToday && (
                                                <Button
                                                    variant="primary"
                                                    className="bg-success hover:bg-success/90"
                                                    onClick={() => onTake(med.id)}
                                                >
                                                    <Check size={16} /> {t.markAsTaken || 'Mark as Taken'}
                                                </Button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(med)}
                                                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                                title={t.edit || "Edit"}
                                            >
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onDelete(med.id)}
                                                className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                                title={t.deleteMedication || "Delete medication"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Encouraging message for missed doses */}
                                {isMissed && isToday(selectedDate) && (
                                    <div className="ml-4 mt-2 text-sm text-warning flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        <span>{t.missedDoseMessage || "Don't worry! You can still take it now or mark it for next time."}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MedicationList;
