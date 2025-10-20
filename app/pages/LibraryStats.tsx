'use client';

import React from 'react';
import {
  Library,
  UserPlus,
  BookOpen, // Using BookOpen instead of BookCheck
  CalendarDays,
  TrendingDown
} from 'lucide-react';

interface LibraryStatsProps {
  className?: string;
}

const LibraryStats: React.FC<LibraryStatsProps> = ({ className = '' }) => {
  const stats = [
    {
      title: 'Total Books',
      value: '1,234',
      icon: Library,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Members',
      value: '456',
      icon: UserPlus,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Books Checked Out',
      value: '89',
      icon: BookOpen, // Using BookOpen instead of BookCheck
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      title: 'This Month',
      value: '234',
      icon: CalendarDays,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <IconComponent className="h-8 w-8 text-blue-600" />
                <div className="flex items-center">
                  {stat.changeType === 'positive' ? (
                    <TrendingDown className="h-4 w-4 text-green-500 rotate-180" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LibraryStats;
