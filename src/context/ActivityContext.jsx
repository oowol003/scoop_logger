import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  getDoc
} from 'firebase/firestore';

const ActivityContext = createContext();

function activityReducer(state, action) {
  console.log('Reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'SET_ACTIVITIES':
      return action.payload;
    case 'OPTIMISTIC_ADD_ACTIVITY':
      return [...state, action.payload];
    case 'OPTIMISTIC_UPDATE_ACTIVITY':
      return state.map(activity => 
        activity.id === action.payload.id ? action.payload : activity
      );
    case 'OPTIMISTIC_DELETE_ACTIVITY':
      return state.filter(activity => activity.id !== action.payload);
    default:
      return state;
  }
}

export function ActivityProvider({ children }) {
  const [activities, dispatch] = useReducer(activityReducer, []);
  const [logs, dispatchLogs] = useReducer(logsReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for activities
  useEffect(() => {
    console.log('Setting up activities listener...');
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(activitiesRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Activities snapshot received:', snapshot.size, 'documents');
        const activities = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        console.log('Processed activities:', activities);
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
        setLoading(false);
      }, (error) => {
        console.error('Error in activities listener:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up activities listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Real-time listener for logs
  useEffect(() => {
    console.log('Setting up logs listener...');
    try {
      const logsRef = collection(db, 'logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Logs snapshot received:', snapshot.size, 'documents');
        const logs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        console.log('Processed logs:', logs);
        dispatchLogs({ type: 'SET_LOGS', payload: logs });
      }, (error) => {
        console.error('Error in logs listener:', error);
        setError(error.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up logs listener:', err);
      setError(err.message);
    }
  }, []);

  const addActivity = async (activity) => {
    console.log('Adding activity:', activity);
    try {
      // Create a temporary ID for optimistic update
      const tempId = 'temp-' + Date.now();
      const optimisticActivity = {
        ...activity,
        id: tempId,
        createdAt: new Date().toISOString()
      };

      // Update UI immediately
      dispatch({ type: 'OPTIMISTIC_ADD_ACTIVITY', payload: optimisticActivity });

      // Add to Firebase
      const activitiesRef = collection(db, 'activities');
      const { id: _, ...activityData } = activity;
      
      const docRef = await addDoc(activitiesRef, {
        ...activityData,
        createdAt: new Date().toISOString()
      });
      
      const firebaseId = docRef.id;
      console.log('Activity added successfully with Firebase ID:', firebaseId);

      // Update the document with its Firebase ID
      await updateDoc(docRef, { id: firebaseId });
      
      return firebaseId;
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateActivity = async (id, updates) => {
    console.log('Updating activity with Firebase ID:', id);
    console.log('Update data:', updates);
    
    try {
      // Update UI immediately
      dispatch({ type: 'OPTIMISTIC_UPDATE_ACTIVITY', payload: updates });

      // Clean up the updates object to remove any empty values recursively
      const cleanObject = (obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (value === null || value === undefined || value === '') {
            return acc;
          }
          
          if (typeof value === 'object' && !Array.isArray(value)) {
            const cleaned = cleanObject(value);
            if (Object.keys(cleaned).length > 0) {
              acc[key] = cleaned;
            }
          } else {
            acc[key] = value;
          }
          
          return acc;
        }, {});
      };

      // Remove any client-side generated IDs from updates
      const { id: _, ...dirtyUpdates } = updates;
      const cleanUpdates = cleanObject(dirtyUpdates);
      console.log('Clean updates:', cleanUpdates);

      // Update in Firebase
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, cleanUpdates);
      console.log('Activity updated successfully');
    } catch (err) {
      // If Firebase update fails, revert the optimistic update
      const activityRef = doc(db, 'activities', id);
      const activityDoc = await getDoc(activityRef);
      if (activityDoc.exists()) {
        const currentData = { ...activityDoc.data(), id };
        dispatch({ type: 'OPTIMISTIC_UPDATE_ACTIVITY', payload: currentData });
      }
      
      console.error('Error updating activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteActivity = async (id) => {
    console.log('Deleting activity with Firebase ID:', id);
    try {
      // Update UI immediately
      dispatch({ type: 'OPTIMISTIC_DELETE_ACTIVITY', payload: id });

      // Delete from Firebase
      const activityRef = doc(db, 'activities', id);
      await deleteDoc(activityRef);
      console.log('Activity deleted successfully');
    } catch (err) {
      // If Firebase delete fails, revert the optimistic update
      const activityRef = doc(db, 'activities', id);
      const activityDoc = await getDoc(activityRef);
      if (activityDoc.exists()) {
        const currentData = { ...activityDoc.data(), id };
        dispatch({ type: 'OPTIMISTIC_UPDATE_ACTIVITY', payload: currentData });
      }
      
      console.error('Error deleting activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const addLog = async (log) => {
    console.log('Adding log:', log);
    try {
      const logsRef = collection(db, 'logs');
      const docRef = await addDoc(logsRef, {
        ...log,
        timestamp: new Date().toISOString()
      });
      console.log('Log added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error adding log:', err);
      setError(err.message);
      throw err;
    }
  };

  const contextValue = {
    activities,
    logs,
    loading,
    error,
    addActivity,
    updateActivity,
    deleteActivity,
    addLog
  };

  console.log('Current context value:', contextValue);

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
}

function logsReducer(state, action) {
  console.log('Reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'SET_LOGS':
      return action.payload;
    default:
      return state;
  }
}

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}