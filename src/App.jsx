import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { heartRates, medications, contacts } from './services/db';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import StatsOverview from './components/dashboard/StatsOverview';
import HeartRateChart from './components/dashboard/HeartRateChart';
import MedicationList from './components/dashboard/MedicationList';
import ContactsList from './components/dashboard/ContactsList';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';
import Input from './components/ui/Input';
import { Activity, Plus } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard State
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [medicationsList, setMedicationsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);

  // Modals
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [newHr, setNewHr] = useState('');

  // Load User Data from IndexedDB
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load heart rates
      const hrs = await heartRates.where('userId').equals(user.id).toArray();
      setHeartRateHistory(hrs);

      // Load medications
      const meds = await medications.where('userId').equals(user.id).toArray();
      setMedicationsList(meds);

      // Load contacts
      const cts = await contacts.where('userId').equals(user.id).toArray();
      setContactsList(cts);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // --- Heart Rate Handlers ---
  const addHeartRate = async (e) => {
    e.preventDefault();
    if (!newHr || !user) return;

    try {
      const entry = {
        userId: user.id,
        bpm: parseInt(newHr),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      await heartRates.add(entry);
      await loadUserData(); // Reload data
      setNewHr('');
      setIsHrModalOpen(false);
    } catch (error) {
      console.error('Error adding heart rate:', error);
    }
  };

  // --- Medication Handlers ---
  const handleAddMedication = async (med) => {
    if (!user) return;

    try {
      await medications.add({
        userId: user.id,
        ...med,
        records: []
      });
      await loadUserData();
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      await medications.delete(id);
      await loadUserData();
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleTakeMedication = async (id) => {
    try {
      const med = await medications.get(id);
      if (med) {
        const updatedRecords = [...(med.records || []), { date: new Date().toISOString(), taken: true }];
        await medications.update(id, { records: updatedRecords });
        await loadUserData();
      }
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  // --- Contact Handlers ---
  const handleAddContact = async (contact) => {
    if (!user) return;

    try {
      await contacts.add({
        userId: user.id,
        ...contact
      });
      await loadUserData();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await contacts.delete(id);
      await loadUserData();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleUpdateContact = async (id, updatedContact) => {
    try {
      await contacts.update(id, updatedContact);
      await loadUserData();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin text-primary">
          <Activity size={48} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" />
        <div className="w-full max-w-md relative z-10 glass-panel p-8 rounded-2xl shadow-glow animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-primary/20 text-primary mb-4">
              <Activity size={40} />
            </div>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Health Tracker
            </h1>
            <p className="text-text-muted mt-2">{t.monitorHealthJourney || 'Monitor your health journey'}</p>
          </div>

          {isSignUp ? (
            <SignupForm onSwitchToLogin={() => setIsSignUp(false)} />
          ) : (
            <LoginForm onSwitchToSignup={() => setIsSignUp(true)} />
          )}
        </div>
      </div>
    );
  }

  // Dashboard Renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <StatsOverview heartRateHistory={heartRateHistory} medications={medicationsList} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HeartRateChart data={heartRateHistory} />
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-text-main">{t.quickActions || 'Quick Actions'}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setIsHrModalOpen(true)} className="h-24 flex-col">
                    <Activity size={24} className="text-secondary" />
                    {t.recordHeartRate || 'Record Heart Rate'}
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('medications')} className="h-24 flex-col">
                    <Plus size={24} className="text-primary" />
                    {t.addMedication || 'Add Medication'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'heartRate':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-main">Heart Rate History</h2>
              <Button onClick={() => setIsHrModalOpen(true)}>
                <Plus size={18} /> {t.recordHeartRate || 'Record Reading'}
              </Button>
            </div>
            <HeartRateChart data={heartRateHistory} />
          </div>
        );
      case 'medications':
        return (
          <MedicationList
            medications={medicationsList}
            onAdd={handleAddMedication}
            onDelete={handleDeleteMedication}
            onTake={handleTakeMedication}
          />
        );
      case 'contacts':
        return (
          <ContactsList
            contacts={contactsList}
            onAdd={handleAddContact}
            onDelete={handleDeleteContact}
            onUpdate={handleUpdateContact}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </DashboardLayout>

      <Modal
        isOpen={isHrModalOpen}
        onClose={() => setIsHrModalOpen(false)}
        title={t.recordHeartRate || 'Record Heart Rate'}
      >
        <form onSubmit={addHeartRate} className="flex flex-col gap-4">
          <Input
            label="BPM"
            type="number"
            value={newHr}
            onChange={(e) => setNewHr(e.target.value)}
            placeholder="e.g. 72"
            autoFocus
            required
          />
          <div className="flex gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsHrModalOpen(false)} className="flex-1">
              {t.cancel || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {t.save || 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const App = () => {
  return (
    <PreferencesProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </PreferencesProvider>
  );
};

export default App;
