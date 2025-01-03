// Mock API service
export const api = {
    getActivities: async () => {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    },
  
    createActivity: async (activity) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...activity,
        _id: Date.now().toString()
      };
    },
  
    updateActivity: async (id, updates) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        _id: id,
        ...updates
      };
    },
  
    deleteActivity: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    },
  
    getLogs: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    },
  
    createLog: async (logData) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        _id: Date.now().toString(),
        ...logData,
        timestamp: new Date().toISOString()
      };
    }
  };
  
  export default api;