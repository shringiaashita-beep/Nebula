import { useState, useEffect } from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
