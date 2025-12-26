import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, Check, Trash2, Clock, Pill } from 'lucide-react';

const MedicationList = ({ medications, onAdd, onDelete, onTake }) => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMed, setNewMed] = useState({
        name: '',
        dose: '',
        time: '',
        timing: 'before'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newMed);
        setNewMed({ name: '', dose: '', time: '', timing: 'before' });
        setIsModalOpen(false);
    };

    const isTakenToday = (med) => {
        const today = new Date().toDateString();
        const record = med.records?.find(r => new Date(r.date).toDateString() === today);
        return record?.taken;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-text-main">{t.yourMedications}</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> {t.addMedication}
                </Button>
            </div>

            {medications.length === 0 ? (
                <Card className="text-center py-16">
                    <Pill size={56} className="mx-auto mb-4 text-text-muted opacity-40" />
                    <p className="text-text-muted text-lg">{t.noMedications}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {medications.map(med => {
                        const taken = isTakenToday(med);
                        return (
                            <Card key={med.id} className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-text-main truncate">{med.name}</h3>
                                        <p className="text-sm text-text-muted mt-0.5">{med.dose}</p>
                                    </div>
                                    <button
                                        onClick={() => onDelete(med.id)}
                                        className="ml-2 p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
                                        title="Delete medication"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${taken ? 'bg-success/20 text-success' : 'bg-bg-primary text-text-muted'
                                        }`}>
                                        <Clock size={14} />
                                        <span>{med.time}</span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-bg-primary text-text-muted text-xs">
                                        {med.timing === 'before' ? t.beforeMeal : t.afterMeal}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-auto pt-2">
                                    {!taken ? (
                                        <Button
                                            variant="primary"
                                            className="w-full bg-success hover:bg-success/90"
                                            onClick={() => onTake(med.id)}
                                        >
                                            <Check size={16} /> Mark as Taken
                                        </Button>
                                    ) : (
                                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-success/10 text-success border border-success/30">
                                            <Check size={16} />
                                            <span className="font-medium">Taken Today</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t.addMedication}
            >
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
                        label={t.time}
                        type="time"
                        value={newMed.time}
                        onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                        required
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-muted">Timing</label>
                        <select
                            className="glass-input p-3 rounded-lg w-full"
                            value={newMed.timing}
                            onChange={e => setNewMed({ ...newMed, timing: e.target.value })}
                        >
                            <option value="before" className="bg-bg-card">{t.beforeMeal}</option>
                            <option value="after" className="bg-bg-card">{t.afterMeal}</option>
                        </select>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            {t.cancel}
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {t.save}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MedicationList;
