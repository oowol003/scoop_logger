// ActivityList.jsx
import React, { useContext } from 'react';
import { ActivityContext } from '../../context/ActivityContext';

const ActivityList = () => {
  const { activities } = useContext(ActivityContext);

  return (
    <div>
      {activities.length > 0 ? (
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>{activity.name}</li>
          ))}
        </ul>
      ) : (
        <p>No activities available</p>
      )}
    </div>
  );
};

export default ActivityList;
