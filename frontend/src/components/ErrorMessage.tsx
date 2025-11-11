import * as React from 'react';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

const ErrorMessage = ({ message = 'Something went wrong.', className = '' }: ErrorMessageProps) => (
  <div role="alert" className={`text-red-600 ${className}`.trim()}>
    {message}
  </div>
);

export default ErrorMessage;
