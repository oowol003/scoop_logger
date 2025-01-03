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
  onSnapshot 
} from 'firebase/firestore';

const ActivityContext = createContext();

function activityReducer(state, action) {
  console.log('Reducer action:', action.type, action.payload);
  switch (action.type) {
    case 'SET_LOGS':
      return {
        ...state,
        logs: action.payload
      };
    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload]
      };
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload.reduce((acc, activity) => {
          acc[activity.id] = activity;
          return acc;
        }, {})
      };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: {
          ...state.activities,
          [action.payload.id]: action.payload
        }
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: {
          ...state.activities,
          [action.payload.id]: {
            ...state.activities[action.payload.id],
            ...action.payload
          }
        }
      };
    case 'DELETE_ACTIVITY':
      const { [action.payload]: deleted, ...remaining } = state.activities;
      return {
        ...state,
        activities: remaining
      };
    default:
      return state;
  }
}

export function ActivityProvider({ children }) {
  const [state, dispatch] = useReducer(activityReducer, {
    activities: {},
    logs: []
  });

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
          id: doc.id,
          ...doc.data()
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
          id: doc.id,
          ...doc.data()
        }));
        console.log('Processed logs:', logs);
        dispatch({ type: 'SET_LOGS', payload: logs });
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
      const activitiesRef = collection(db, 'activities');
      const docRef = await addDoc(activitiesRef, {
        ...activity,
        createdAt: new Date().toISOString()
      });
      console.log('Activity added successfully with ID:', docRef.id);
      
      // Note: We don't need to dispatch here as the onSnapshot listener will handle it
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.message);
      throw err; // Re-throw to handle in the UI
    }
  };

  const updateActivity = async (id, updates) => {
    console.log('Updating activity:', id, updates);
    try {
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, updates);
      console.log('Activity updated successfully');
      
      // Note: We don't need to dispatch here as the onSnapshot listener will handle it
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteActivity = async (id) => {
    console.log('Deleting activity:', id);
    try {
      const activityRef = doc(db, 'activities', id);
      await deleteDoc(activityRef);
      console.log('Activity deleted successfully');
      
      // Note: We don't need to dispatch here as the onSnapshot listener will handle it
    } catch (err) {
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
      
      // Note: We don't need to dispatch here as the onSnapshot listener will handle it
    } catch (err) {
      console.error('Error adding log:', err);
      setError(err.message);
      throw err;
    }
  };

  const contextValue = {
    activities: state.activities,
    logs: state.logs,
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

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}