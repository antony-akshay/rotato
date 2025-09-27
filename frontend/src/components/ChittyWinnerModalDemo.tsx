"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

// TypeScript interfaces
interface ChittyScheme {
  schemeName: string;
  owner: string;
  totalCycles: number;
  monthlyAmount: number;
  contributeAmount: number;
}

interface ChittyWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chittyData: ChittyScheme;
  onSelectWinner: () => Promise<void>;
}

const ChittyWinnerModal: React.FC<ChittyWinnerModalProps> = ({
  isOpen,
  onClose,
  chittyData,
  onSelectWinner
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const handleSelectWinner = async (): Promise<void> => {
    setIsSelecting(true);
    try {
      await onSelectWinner();
    } catch (error) {
      console.error('Error selecting winner:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 border-2 border-black">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSelecting}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 pt-12">
          {/* Chitty details */}
          <div className="space-y-4 mb-8">
            <div className="text-xl font-medium text-gray-800">
              {chittyData.schemeName}
            </div>
            
            <div className="text-gray-700">
              owner
            </div>
            <div className="font-medium text-gray-800">
              {chittyData.owner}
            </div>
            
            <div className="text-gray-700">
              totalCycles;
            </div>
            <div className="font-medium text-gray-800">
              {chittyData.totalCycles}
            </div>
            
            <div className="text-gray-700">
              monthly_amount
            </div>
            <div className="font-medium text-gray-800">
              ₹{chittyData.monthlyAmount.toLocaleString()}
            </div>
            
            <div className="text-gray-700">
              contribute_amount
            </div>
            <div className="font-medium text-gray-800">
              ₹{chittyData.contributeAmount.toLocaleString()}
            </div>
          </div>

          {/* Select winner button */}
          <div className="flex justify-end">
            <button
              onClick={handleSelectWinner}
              disabled={isSelecting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg border border-gray-400 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {isSelecting ? 'Selecting...' : 'select_winner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component
const ChittyWinnerModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const sampleChittyData: ChittyScheme = {
    schemeName: "Monthly Savings Circle",
    owner: "0x1234...5678",
    totalCycles: 12,
    monthlyAmount: 1000,
    contributeAmount: 8000
  };

  const handleSelectWinner = async (): Promise<void> => {
    console.log('Selecting winner...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Winner selected!');
  };

  return (
    <div className="bg-black-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Chitty Name</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Open Chitty Modal
        </button>
        
        <ChittyWinnerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          chittyData={sampleChittyData}
          onSelectWinner={handleSelectWinner}
        />
      </div>
    </div>
  );
};

export default ChittyWinnerModalDemo;