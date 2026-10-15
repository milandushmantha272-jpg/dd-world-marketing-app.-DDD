import React from 'react';
import { List } from 'lucide-react';

export const IndexTableOfContents: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-xs space-y-2">
      <div className="flex items-center gap-2 font-bold text-amber-500">
        <List className="w-4 h-4" />
        <span>Quick Navigation Index</span>
      </div>
      <p className="text-slate-400">DD WORLD Control Hub Modules</p>
    </div>
  );
};
