import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Phone, Users, Trash2, X, Pencil } from 'lucide-react';
import { COUNTRY_CODES } from '../../constants/countryCodes';

const ContactsList = ({ contacts, onAdd, onDelete, onUpdate }) => {
    const { t } = useLanguage();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [newContact, setNewContact] = useState({
        name: '',
        relationship: '',
        countryCode: '+1',
        phone: ''
    });

    const validatePhone = (phone) => {
        // Remove all non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');

        // Check if it has at least 10 digits
        if (digitsOnly.length < 10) {
            return t.phoneMinLength || 'Phone number must be at least 10 digits';
        }

        // Check if it's a valid format (allows +, spaces, dashes, parentheses)
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(phone)) {
            return t.invalidPhoneFormat || 'Invalid phone number format';
        }

        return null;
    };

    const handlePhoneChange = (e) => {
        const input = e.target.value;
        // Only allow numbers and common phone formatting characters: + - ( ) space
        const filtered = input.replace(/[^0-9+\-() ]/g, '');
        setNewContact({ ...newContact, phone: filtered });

        // Clear error when user starts typing
        if (phoneError) {
            setPhoneError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate phone number
        const error = validatePhone(newContact.phone);
        if (error) {
            setPhoneError(error);
            return;
        }

        const contactData = {
            ...newContact,
            phone: `${newContact.countryCode}${newContact.phone}`
        };

        if (editingId) {
            onUpdate(editingId, contactData);
        } else {
            onAdd(contactData);
        }

        setNewContact({ name: '', relationship: '', countryCode: '+1', phone: '' });
        setEditingId(null);
        setPhoneError('');
        setIsFormOpen(false);
    };

    const handleCancel = () => {
        setNewContact({ name: '', relationship: '', countryCode: '+1', phone: '' });
        setEditingId(null);
        setPhoneError('');
        setIsFormOpen(false);
    };

    const handleEdit = (contact) => {
        // Try to extract country code and phone number
        // This is a simple heuristic - finds the matching country code prefix
        let countryCode = '+1';
        let phoneNumber = contact.phone;

        // Sort country codes by length (descending) to match longest prefix first
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

        for (const country of sortedCodes) {
            if (contact.phone.startsWith(country.code)) {
                countryCode = country.code;
                phoneNumber = contact.phone.slice(country.code.length);
                break;
            }
        }

        setNewContact({
            name: contact.name,
            relationship: contact.relationship,
            countryCode,
            phone: phoneNumber
        });
        setEditingId(contact.id);
        setPhoneError('');
        setIsFormOpen(true);
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-text-main">{t.yourContacts}</h2>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus size={18} /> {t.addEmergencyContact}
                    </Button>
                )}
            </div>

            {/* Add/Edit Contact Form */}
            {isFormOpen && (
                <Card className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-text-main">
                            {editingId ? (t.editContact || 'Edit Contact') : t.addEmergencyContact}
                        </h3>
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label={t.contactName}
                            value={newContact.name}
                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                            placeholder="e.g., Dr. Smith"
                            required
                        />
                        <Input
                            label={t.relationship}
                            value={newContact.relationship}
                            onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                            placeholder="e.g., Family Doctor"
                            required
                        />
                        <div>
                            <label className="text-sm font-medium text-text-muted mb-2 block">{t.phoneNumber}</label>
                            <div className="flex gap-2">
                                {/* Country Code Dropdown */}
                                <select
                                    className="glass-input p-3 rounded-lg w-40"
                                    value={newContact.countryCode}
                                    onChange={e => setNewContact({ ...newContact, countryCode: e.target.value })}
                                >
                                    {COUNTRY_CODES.map(({ code, country, flag }) => (
                                        <option key={country} value={code} className="bg-bg-card">
                                            {flag} {code} {country}
                                        </option>
                                    ))}
                                </select>

                                {/* Phone Number Input */}
                                <div className="flex-1">
                                    <input
                                        type="tel"
                                        className="glass-input p-3 rounded-lg w-full"
                                        value={newContact.phone}
                                        onChange={handlePhoneChange}
                                        placeholder="123 456 7890"
                                        pattern="[0-9\-() ]{7,}"
                                        title={t.validPhoneTitle || "Please enter a valid phone number"}
                                        required
                                    />
                                </div>
                            </div>
                            {phoneError && (
                                <p className="text-sm text-danger mt-1">{phoneError}</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                                {t.cancel}
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                {editingId ? (t.update || 'Update') : t.save}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Contacts List */}
            {contacts.length === 0 && !isFormOpen ? (
                <Card className="text-center py-16">
                    <Users size={56} className="mx-auto mb-4 text-text-muted opacity-40" />
                    <p className="text-text-muted text-lg">{t.noContacts}</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {contacts.map(contact => (
                        <Card key={contact.id} className="p-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                {/* Left: Contact Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="p-3 rounded-full bg-primary/20 flex-shrink-0">
                                        <Users size={24} className="text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-text-main truncate">{contact.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-sm text-text-muted">{contact.relationship}</span>
                                            <span className="text-xs text-text-muted">•</span>
                                            <div className="flex items-center gap-1 text-sm text-text-muted">
                                                <Phone size={12} />
                                                <span>{contact.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="primary"
                                        className="bg-success hover:bg-success/90"
                                        onClick={() => handleCall(contact.phone)}
                                    >
                                        <Phone size={16} /> {t.call}
                                    </Button>
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                        title={t.editContactTitle || "Edit contact"}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(contact.id)}
                                        className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                        title={t.deleteContact || "Delete contact"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactsList;
