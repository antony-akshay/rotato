"use client";

import React from "react";

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
  onJoinClick,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".join-button")) return;
    onCardClick?.();
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoinClick?.();
  };

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border-2 border-indigo-300 from-blue-50 to-indigo-100 p-6 cursor-pointer shadow-lg transition-all duration-300 hover:from-blue-100 hover:to-indigo-200 hover:border-indigo-400 hover:shadow-xl"
      onClick={handleCardClick}
    >
      {/* Card Content */}
      <div className="space-y-3 mb-6">
        <div className="text-indigo-900 font-bold text-xl">{chitty_name}</div>
        <div className="text-indigo-700 text-sm bg-indigo-200 rounded-full px-3 py-1 inline-block">
          Owner: {owner}
        </div>
        <div className="text-purple-700 font-medium">
          <span className="text-purple-500">Cycles:</span> {totalCycles}
        </div>
        <div className="text-green-700 font-medium">
          <span className="text-green-500">Monthly:</span> ₹
          {monthly_amount.toLocaleString()}
        </div>
        <div className="text-orange-700 font-medium">
          <span className="text-orange-500">Contribute:</span> ₹
          {contribute_amount.toLocaleString()}
        </div>
      </div>

      {/* Join Button */}
      <button
        className="join-button w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 font-semibold text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-105"
        onClick={handleJoinClick}
      >
        Join
      </button>
    </div>
  );
};

export default JoinChittyCard;
