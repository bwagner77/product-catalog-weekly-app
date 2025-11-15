import * as React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading = ({ message = 'Loading…', className = '' }: LoadingProps) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-center gap-2 text-gray-600 ${className}`.trim()}
  >
    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" aria-hidden="true" />
    <span>{message}</span>
  </div>
);

export default Loading;
