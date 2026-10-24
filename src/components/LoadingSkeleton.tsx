import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Hero Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 h-80 rounded-[24px] bg-white/70 border border-slate-200/60 p-6 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-slate-200/70" />
        </div>
        <div className="xl:col-span-5 flex flex-col justify-between gap-4">
          <div className="h-24 rounded-[22px] bg-white/70 border border-slate-200/60" />
          <div className="h-24 rounded-[22px] bg-white/70 border border-slate-200/60" />
          <div className="h-24 rounded-[22px] bg-white/70 border border-slate-200/60" />
        </div>
      </div>

      {/* 6 Tiles Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-[22px] bg-white/70 border border-slate-200/60" />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-72 rounded-[24px] bg-white/70 border border-slate-200/60" />
    </div>
  );
};
