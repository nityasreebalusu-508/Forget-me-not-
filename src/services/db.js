import Dexie from 'dexie';

// Create database instance
export const db = new Dexie('HealthTrackerDB');

// Define database schema
db.version(1).stores({
    // Users table
    users: '++id, &email, phone, passwordHash, createdAt',

    // Heart rate records
    heartRates: '++id, userId, bpm, timestamp, date, time',

    // Medications
    medications: '++id, userId, name, dose, time, timing',

    // Emergency contacts
    contacts: '++id, userId, name, relationship, phone',

    // Preferences (key-value store)
    preferences: 'key, value'
});

// Export table references for easy access
export const { users, heartRates, medications, contacts, preferences } = db;

// Helper function to get current user ID from session
export const getCurrentUserId = async () => {
    const session = await preferences.get('currentUser');
    return session?.value;
};

// Helper function to set current user
export const setCurrentUser = async (userId) => {
    await preferences.put({ key: 'currentUser', value: userId });
};

// Helper function to clear current user (logout)
export const clearCurrentUser = async () => {
    await preferences.delete('currentUser');
};

export default db;
