import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProgressIndicatorProps {
  isLoading: boolean;
  stages?: string[];
  currentStage?: number;
}

export default function ProgressIndicator({
  isLoading,
  stages = [
    'Detecting blockchain types...',
    'Fetching wallet balances...',
    'Collecting token data...',
    'Fetching historical prices...',
    'Calculating portfolio values...',
  ],
  currentStage = 0,
}: ProgressIndicatorProps) {
  const [displayedStage, setDisplayedStage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setDisplayedStage(0);
      return;
    }

    // Auto-progress through stages for better UX (even if we don't have real-time updates)
    const interval = setInterval(() => {
      setDisplayedStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000); // Change stage every 3 seconds

    return () => clearInterval(interval);
  }, [isLoading, stages.length]);

  if (!isLoading) return null;

  const progress = ((displayedStage + 1) / stages.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center">
          <LoadingSpinner size="lg" message="Analyzing your wallets..." />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center opacity-70">
            Step {displayedStage + 1} of {stages.length}
          </p>
        </div>

        {/* Current stage */}
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                index === displayedStage
                  ? 'opacity-100 font-medium'
                  : index < displayedStage
                  ? 'opacity-50'
                  : 'opacity-30'
              }`}
            >
              {index < displayedStage ? (
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : index === displayedStage ? (
                <div className="w-5 h-5 flex-shrink-0">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-current opacity-30 flex-shrink-0" />
              )}
              <span>{stage}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-center opacity-50">
            This may take a few moments depending on the number of tokens...
          </p>
          <p className="text-xs text-center opacity-70 font-medium">
            Large wallets with many transactions may take up to 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
