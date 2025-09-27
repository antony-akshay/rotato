"use client";

import React from 'react';
import { useEnsResolver } from '../hooks/ensResolver';

interface PayChittyCardProps {
  chitty_name: string;
  time_period: string;
  monthly_amount: number;
  contribute_amount: number;
  schemaId: string;
}

function PayChittyCard({
  chitty_name,
  time_period,
  monthly_amount,
  contribute_amount,
  schemaId,
}: PayChittyCardProps) {
  // Use ENS resolver hook with example address or dynamic address
  // Setup your target address as needed; using hardcoded here for demo
  const { ensName, isLoading, isError, error } = useEnsResolver('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');

  const handlePay = () => {
    console.log(`ENS Name: ${ensName}`);
    console.log('Pay clicked for schemaId:', schemaId);
    console.log({ chitty_name, time_period, monthly_amount, contribute_amount });
    if (ensName) {
      alert(`Pay clicked for chitty: ${chitty_name} (${ensName}) with schema: ${schemaId}`);
    } else {
      alert(`Pay clicked for chitty: ${chitty_name} with schema: ${schemaId}`);
    }
  };

  return (
    <div className="mt-12 relative w-[340px] rounded-[18px] border-2 border-gray-800 bg-green-300 p-7 font-[Comic_Sans_MS_cursive] text-gray-900 shadow-md shadow-blue-100">
      <div className="mb-4 text-[22px] font-semibold leading-relaxed">
        <div>chitty_name: <span className="font-normal">{chitty_name}</span></div>
        <div>time_period: <span className="font-normal">{time_period}</span></div>
        <div>monthly_amount: <span className="font-normal">{monthly_amount}</span></div>
        <div>contribute_amount: <span className="font-normal">{contribute_amount}</span></div>
        <div>schemaId: <span className="font-normal">{schemaId}</span></div>
      </div>
      <button
        onClick={handlePay}
        className="absolute bottom-7 right-7 rounded-[10px] border-2 border-gray-800 bg-white px-9 py-2 text-[18px] font-semibold shadow-sm shadow-blue-100 outline-none transition hover:bg-gray-100 cursor-pointer"
      >
        pay
      </button>
    </div>
  );
}

export default PayChittyCard;
