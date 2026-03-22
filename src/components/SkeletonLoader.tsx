export function WalletSkeleton() {
  return (
    <div className="card p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div>
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Token rows skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-2 ml-auto" />
              <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Total skeleton */}
      <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card p-8 animate-pulse">
      <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-6" />
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    </div>
  );
}

export function AnalysisLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ChartSkeleton />
      <WalletSkeleton />
      <WalletSkeleton />
    </div>
  );
}
