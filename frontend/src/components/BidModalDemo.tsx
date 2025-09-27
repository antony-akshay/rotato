"use client";

import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ChittyData {
  schemeName: string;
  monthlyAmount: number;
  currentCycle: number;
  totalPool: number;
  minBidPercent: number;
  maxMembers: number;
  currentMembers: number;
}

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  chittyData?: ChittyData | null;
  onSubmitBid?: (bidAmount: number) => Promise<void> | void;
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, chittyData = null, onSubmitBid }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const defaultChittyData: ChittyData = {
    schemeName: "Monthly Savings Circle",
    monthlyAmount: 1000,
    currentCycle: 3,
    totalPool: 10000,
    minBidPercent: 75,
    maxMembers: 10,
    currentMembers: 8
  };

  const currentChitty = chittyData || defaultChittyData;
  const minBidAmount = (currentChitty.totalPool * currentChitty.minBidPercent) / 100;
  const maxBidAmount = currentChitty.totalPool;

  const handleBidChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBidAmount(e.target.value);
    setError('');
  };

  const validateBid = (): boolean => {
    const bid = parseFloat(bidAmount);
    if (!bidAmount || isNaN(bid) || bid <= 0) {
      setError('Please enter a valid bid amount');
      return false;
    }
    if (bid < minBidAmount) {
      setError(`Minimum bid is ₹${minBidAmount.toLocaleString()}`);
      return false;
    }
    if (bid > maxBidAmount) {
      setError(`Maximum bid is ₹${maxBidAmount.toLocaleString()}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateBid()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (onSubmitBid) {
        await onSubmitBid(parseFloat(bidAmount));
      }
      setSubmitSuccess(true);
      setTimeout(() => handleClose(), 2000);
    } catch {
      setError('Transaction failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setBidAmount('');
      setError('');
      setSubmitSuccess(false);
      onClose();
    }
  };

  const calculateWinnings = (): number => {
    const bid = parseFloat(bidAmount) || 0;
    return bid > 0 ? bid : 0;
  };

  useEffect(() => {
    if (!isOpen) {
      setBidAmount('');
      setError('');
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-green-400 rounded-t-2xl p-6 relative">
          <button onClick={handleClose} disabled={isSubmitting} aria-label="Close modal" className="absolute right-4 top-4 p-1 rounded-full hover:bg-green-300 transition-colors duration-200 disabled:opacity-50">
            <X className="w-5 h-5 text-green-800" />
          </button>
          <h2 className="text-xl font-bold text-green-800 text-center mb-2">{currentChitty.schemeName}</h2>
          <div className="flex items-center justify-center gap-2 text-green-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Cycle {currentChitty.currentCycle} - Bidding Phase</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pool Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Pool Amount</span>
              <span className="font-bold text-lg text-gray-900">₹{currentChitty.totalPool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Bid Range</span>
              <span className="text-gray-700">₹{minBidAmount.toLocaleString()} - ₹{maxBidAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Bid Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={bidAmount}
                onChange={handleBidChange}
                placeholder={`Min: ${minBidAmount.toLocaleString()}`}
                min={minBidAmount}
                max={maxBidAmount}
                disabled={isSubmitting || submitSuccess}
                className={`w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all duration-200 text-lg font-medium ${
                  error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''
                } ${
                  isSubmitting || submitSuccess ? 'bg-gray-100 text-gray-500' : 'bg-white'
                }`}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Bid Preview */}
          {bidAmount && !error && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Bid Preview</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">If you win, you'll receive:</span>
                  <span className="font-bold text-green-700">₹{calculateWinnings().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentage of pool:</span>
                  <span className="text-green-700">{Math.round((parseFloat(bidAmount) / currentChitty.totalPool) * 100) || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={handleClose} disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess || !bidAmount}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : submitSuccess
                  ? 'bg-green-600 text-white'
                  : bidAmount && !error
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Placing Bid...
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Bid Placed!
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Place Bid
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">Bidding Rules:</p>
                <ul className="text-blue-700 space-y-0.5 text-xs">
                  <li>• Minimum bid is 75% of total pool</li>
                  <li>• Winner is selected randomly from all bidders</li>
                  <li>• Higher bids don't guarantee winning</li>
                  <li>• Bidding period ends in 2 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BidModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  const handleSubmitBid = async (bidAmount: number) => {
    console.log('Submitting bid:', bidAmount);
    // smart contract call here
  };

  return (
    <div className=" bg-grey-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Chitty Name</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Open Bid Modal
        </button>
      </div>

      <BidModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmitBid={handleSubmitBid} />
    </div>
  );
};

export default BidModalDemo;
