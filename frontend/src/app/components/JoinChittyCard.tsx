"use client";

import React from 'react';

interface JoinChittyCardProps {
  chitty_name: string;
  owner: string;
  totalCycles: number;
  monthly_amount: number;
  contribute_amount: number;
  onCardClick?: () => void;
  onJoinClick?: () => void;
}

const JoinChittyCard: React.FC<JoinChittyCardProps> = ({
  chitty_name,
  owner,
  totalCycles,
  monthly_amount,
  contribute_amount,
  onCardClick,
  onJoinClick
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on the join button
    if ((e.target as HTMLElement).closest('.join-button')) {
      return;
    }
    onCardClick?.();
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoinClick?.();
  };

  return (
    <div 
      className="mt-20 w-80 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-indigo-300 rounded-2xl p-6 cursor-pointer hover:from-blue-100 hover:to-indigo-200 hover:border-indigo-400 transition-all duration-300 relative max-w-md shadow-lg hover:shadow-xl"
      onClick={handleCardClick}
    >
      <div className="space-y-2 mb-4">
        <div className="text-indigo-900 font-bold text-lg">{chitty_name}</div>
        <div className="text-indigo-700 font-medium text-sm bg-indigo-200 rounded-full px-3 py-1 inline-block">
          Owner: {owner}
        </div>
        <div className="text-purple-700 font-medium">
          <span className="text-purple-500">Cycles:</span> {totalCycles}
        </div>
        <div className="text-green-700 font-medium">
          <span className="text-green-500">Monthly:</span> ₹{monthly_amount.toLocaleString()}
        </div>
        <div className="text-orange-700 font-medium">
          <span className="text-orange-500">Contribute:</span> ₹{contribute_amount.toLocaleString()}
        </div>
      </div>
      
      <button
        className="join-button absolute bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        onClick={handleJoinClick}
      >
        Join
      </button>
    </div>
  );
};

export default JoinChittyCard;
