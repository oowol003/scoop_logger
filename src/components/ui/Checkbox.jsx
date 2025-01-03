// Checkbox.jsx
import React from 'react';

const Checkbox = ({ checked, onChange, ...props }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      {...props}
    />
  );
};

export default Checkbox;
