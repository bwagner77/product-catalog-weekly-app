import React from 'react';

const AccessDenied: React.FC = () => {
  return (
    <div
      role="alert"
      aria-labelledby="access-denied-heading"
      className="border border-red-300 bg-red-50 text-red-700 p-4 rounded text-sm"
      data-testid="access-denied"
    >
      <h2 id="access-denied-heading" className="font-semibold mb-1 text-red-800 text-sm">Access Denied</h2>
      <p className="text-xs">Admin access required. Please log in to continue.</p>
    </div>
  );
};

export default AccessDenied;
