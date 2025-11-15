import * as React from 'react';

interface EmptyStateProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState = ({ message = 'No items found.', className = '', children }: EmptyStateProps) => (
  <div className={`text-gray-700 ${className}`.trim()}>
    <p>{message}</p>
    {children}
  </div>
);

export default EmptyState;
