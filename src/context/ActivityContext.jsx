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
    case 'SET_ACTIVITIES': {
      // Convert array to object with Firebase IDs as keys
      const activitiesMap = action.payload.reduce((acc, activity) => {
        acc[activity.id] = activity;
        return acc;
      }, {});
      return {
        ...state,
        activities: activitiesMap
      };
    }
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: {
          ...state.activities,
          [action.payload.id]: action.payload
        }
      };
    case 'DELETE_ACTIVITY': {
      const { [action.payload]: deleted, ...remaining } = state.activities;
      return {
        ...state,
        activities: remaining
      };
    }
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
        const activities = snapshot.docs.map(doc => {
          console.log('Document ID:', doc.id);
          console.log('Document data:', doc.data());
          return {
            ...doc.data(),
            id: doc.id // Ensure we use Firebase ID
          };
        });
        console.log('Processed activities:', activities);
        
        // Convert array to object with Firebase IDs as keys
        const activitiesMap = activities.reduce((acc, activity) => {
          console.log('Adding activity to map:', activity.id);
          acc[activity.id] = activity;
          return acc;
        }, {});
        console.log('Final activities map:', activitiesMap);
        
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
      
      // Create a clean version of the activity without any ID
      const { id: _, ...activityData } = activity;
      
      // Add the activity to Firestore
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
      // Verify the document exists first
      const activityRef = doc(db, 'activities', id);
      const activityDoc = await getDoc(activityRef);
      
      if (!activityDoc.exists()) {
        throw new Error(`Activity with ID ${id} does not exist`);
      }
      
      // Remove any client-side generated IDs from updates
      const { id: _, ...cleanUpdates } = updates;
      
      await updateDoc(activityRef, cleanUpdates);
      console.log('Activity updated successfully');
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteActivity = async (id) => {
    console.log('Deleting activity with Firebase ID:', id);
    try {
      const activityRef = doc(db, 'activities', id);
      await deleteDoc(activityRef);
      console.log('Activity deleted successfully');
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
      return docRef.id;
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