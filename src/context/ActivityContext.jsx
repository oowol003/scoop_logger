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
  orderBy 
} from 'firebase/firestore';

const ActivityContext = createContext();

function activityReducer(state, action) {
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

  // Fetch activities from Firebase
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(activitiesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const activities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Fetch logs from Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsRef = collection(db, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const logs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        dispatch({ type: 'SET_LOGS', payload: logs });
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError(err.message);
      }
    };

    fetchLogs();
  }, []);

  const addActivity = async (activity) => {
    try {
      const activitiesRef = collection(db, 'activities');
      const docRef = await addDoc(activitiesRef, {
        ...activity,
        createdAt: new Date().toISOString()
      });
      
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: { id: docRef.id, ...activity }
      });
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.message);
    }
  };

  const updateActivity = async (id, updates) => {
    try {
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, updates);
      
      dispatch({
        type: 'UPDATE_ACTIVITY',
        payload: { id, ...updates }
      });
    } catch (err) {
      console.error('Error updating activity:', err);
      setError(err.message);
    }
  };

  const deleteActivity = async (id) => {
    try {
      const activityRef = doc(db, 'activities', id);
      await deleteDoc(activityRef);
      
      dispatch({
        type: 'DELETE_ACTIVITY',
        payload: id
      });
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError(err.message);
    }
  };

  const addLog = async (log) => {
    try {
      const logsRef = collection(db, 'logs');
      const docRef = await addDoc(logsRef, {
        ...log,
        timestamp: new Date().toISOString()
      });
      
      dispatch({
        type: 'ADD_LOG',
        payload: { id: docRef.id, ...log }
      });
    } catch (err) {
      console.error('Error adding log:', err);
      setError(err.message);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activities: state.activities,
        logs: state.logs,
        loading,
        error,
        addActivity,
        updateActivity,
        deleteActivity,
        addLog
      }}
    >
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