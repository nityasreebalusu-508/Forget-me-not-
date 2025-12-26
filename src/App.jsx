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
import { Activity, Plus, Zap } from 'lucide-react';

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
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editingHrId, setEditingHrId] = useState(null);

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
    if (!newHr || !newDate || !newTime || !user) return;

    try {
      const dateTimeString = `${newDate}T${newTime}`;
      const dateObj = new Date(dateTimeString);

      const entry = {
        userId: user.id,
        bpm: parseInt(newHr),
        timestamp: dateObj.toISOString(),
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      if (editingHrId) {
        await heartRates.update(editingHrId, { bpm: parseInt(newHr) });
      } else {
        await heartRates.add(entry);
      }

      await loadUserData(); // Reload data
      setNewHr('');
      setEditingHrId(null);
      setIsHrModalOpen(false);
    } catch (error) {
      console.error('Error adding/updating heart rate:', error);
    }
  };

  const openHrModal = (hr = null) => {
    if (hr) {
      setNewHr(hr.bpm);
      setEditingHrId(hr.id);
      const dt = new Date(hr.timestamp);
      // Format as YYYY-MM-DD for date input
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      setNewDate(`${year}-${month}-${day}`);
      // Format as HH:mm for time input
      setNewTime(dt.toTimeString().slice(0, 5));
    } else {
      setNewHr('');
      setEditingHrId(null);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setNewDate(`${year}-${month}-${day}`);
      setNewTime(now.toTimeString().slice(0, 5));
    }
    setIsHrModalOpen(true);
  };

  const handleDeleteHeartRate = async (id) => {
    try {
      await heartRates.delete(id);
      await loadUserData();
    } catch (error) {
      console.error('Error deleting heart rate:', error);
    }
  };

  const generateMockData = async () => {
    try {
      console.log("Starting mock data generation...");
      if (!user) { console.error("No user found!"); return; }
      console.log("Generating data for user ID:", user.id);

      // Clear existing data first
      await heartRates.clear();
      console.log("Cleared existing heart rate data.");

      const mockData = [];
      const now = new Date();

      // Generate data for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // 1-3 readings per day
        const readingsCount = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < readingsCount; j++) {
          // Random time between 8 AM and 10 PM
          const hour = Math.floor(Math.random() * (22 - 8 + 1)) + 8;
          const minute = Math.floor(Math.random() * 60);
          date.setHours(hour, minute, 0);

          // Random BPM with some variation
          // Mostly normal (60-100), occasional spikes
          let bpm = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
          if (Math.random() > 0.8) bpm += Math.floor(Math.random() * 30); // Occasional high
          if (Math.random() > 0.95) bpm -= Math.floor(Math.random() * 15); // Rare low

          mockData.push({
            userId: user.id,
            bpm: bpm,
            timestamp: date.toISOString(),
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          });
        }
      }

      console.log(`Generated ${mockData.length} mock entries.`);
      await heartRates.bulkAdd(mockData);
      console.log("Bulk add complete. Reloading user data...");
      await loadUserData();
      console.log("User data reloaded.");
    } catch (error) {
      console.error("Error generating mock data:", error);
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

  const handleUpdateMedication = async (id, updatedMed) => {
    try {
      await medications.update(id, updatedMed);
      await loadUserData();
    } catch (error) {
      console.error('Error updating medication:', error);
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
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8">
        <div className="animate-spin text-primary mb-4">
          <Activity size={56} />
        </div>
        <p className="text-lg text-text-muted animate-pulse">Loading your health data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary bg-gradient-to-br from-primary/5 via-bg-primary to-secondary/5">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl animate-fade-in border border-glass-border">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
              <Activity size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Forget Me Not: Health Tracker
            </h1>
            <p className="text-text-muted text-center">{t.monitorHealthJourney || 'Monitor your health journey'}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HeartRateChart data={heartRateHistory} onDelete={handleDeleteHeartRate} onEdit={openHrModal} />
              </div>
              <div>
                <Card className="h-full p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-text-main">{t.quickActions || 'Quick Actions'}</h3>
                      <p className="text-sm text-text-muted mt-1">Quickly manage your health data</p>
                    </div>

                    <div className="flex-1 space-y-4">
                      <Button
                        variant="secondary"
                        onClick={() => openHrModal()}
                        className="w-full h-auto p-4 flex items-center gap-4 justify-start hover:bg-primary/5 transition-all"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Activity size={22} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-text-main">{t.recordHeartRate || 'Record Heart Rate'}</p>
                          <p className="text-xs text-text-muted">Add a new heart rate reading</p>
                        </div>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => setActiveTab('medications')}
                        className="w-full h-auto p-4 flex items-center gap-4 justify-start hover:bg-primary/5 transition-all"
                      >
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                          <Plus size={22} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-text-main">{t.addMedication || 'Add Medication'}</p>
                          <p className="text-xs text-text-muted">Track new medication</p>
                        </div>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => setActiveTab('contacts')}
                        className="w-full h-auto p-4 flex items-center gap-4 justify-start hover:bg-primary/5 transition-all"
                      >
                        <div className="p-2 rounded-lg bg-success/10 text-success">
                          <Plus size={22} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-text-main">Add Contact</p>
                          <p className="text-xs text-text-muted">Emergency contact info</p>
                        </div>
                      </Button>

                      {false && (<Button
                        variant="secondary"
                        onClick={generateMockData}
                        className="w-full h-auto p-4 flex items-center gap-4 justify-start hover:bg-primary/5 transition-all mt-6"
                      >
                        <div className="p-2 rounded-lg bg-warning/10 text-warning">
                          <Zap size={22} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-text-main">Generate Mock Data</p>
                          <p className="text-xs text-text-muted">Populate with sample readings</p>
                        </div>
                      </Button>)}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                      <p className="text-xs text-text-muted text-center">
                        {heartRateHistory.length} heart rate readings • {medicationsList.length} medications • {contactsList.length} contacts
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'heartRate':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-text-main">Heart Rate History</h2>
                <p className="text-text-muted mt-1">Track and analyze your heart rate readings</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {false && (<Button onClick={generateMockData} variant="secondary" className="gap-2">
                  <Zap size={18} /> Add Mock Data
                </Button>)}
                <Button onClick={() => openHrModal()} className="gap-2">
                  <Plus size={18} /> {t.recordHeartRate || 'Record Reading'}
                </Button>
              </div>
            </div>
            <HeartRateChart data={heartRateHistory} onDelete={handleDeleteHeartRate} onEdit={openHrModal} />
          </div>
        );
      case 'medications':
        return (
          <MedicationList
            medications={medicationsList}
            onAdd={handleAddMedication}
            onDelete={handleDeleteMedication}
            onUpdate={handleUpdateMedication}
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
        title={editingHrId ? (t.editHeartRate || 'Edit Heart Rate') : (t.recordHeartRate || 'Record Heart Rate')}
      >
        <form onSubmit={addHeartRate} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label={t.date || 'Date'}
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <Input
              label={t.time || 'Time'}
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>
          <Input
            label="Heart Rate (BPM)"
            type="number"
            value={newHr}
            onChange={(e) => setNewHr(e.target.value)}
            placeholder="e.g. 72"
            autoFocus
            required
            min="30"
            max="250"
          />
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsHrModalOpen(false)} className="flex-1 py-3">
              {t.cancel || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" className="flex-1 py-3">
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