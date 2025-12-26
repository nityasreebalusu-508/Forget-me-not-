import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, Phone, Trash2, User } from 'lucide-react';

const ContactsList = ({ contacts, onAdd, onDelete }) => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        relationship: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newContact);
        setNewContact({ name: '', relationship: '', phone: '' });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t.yourContacts}</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> {t.addEmergencyContact}
                </Button>
            </div>

            {contacts.length === 0 ? (
                <Card className="text-center py-12 text-text-muted">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t.noContacts}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map(contact => (
                        <Card key={contact.id} className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{contact.name}</h3>
                                    <p className="text-sm text-text-muted">{contact.relationship}</p>
                                </div>
                                <button
                                    onClick={() => onDelete(contact.id)}
                                    className="text-text-muted hover:text-danger transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mt-2">
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="w-full btn btn-primary flex items-center justify-center gap-2 no-underline"
                                >
                                    <Phone size={16} /> {t.call}
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t.addEmergencyContact}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label={t.contactName}
                        value={newContact.name}
                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        required
                    />
                    <Input
                        label={t.relationship}
                        value={newContact.relationship}
                        onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                        required
                    />
                    <Input
                        label={t.phoneNumber}
                        type="tel"
                        value={newContact.phone}
                        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        required
                    />

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

export default ContactsList;
