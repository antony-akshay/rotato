"use client";

import React from "react";
import { useEnsResolver } from "../hooks/ensResolver";

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
  const { ensName } = useEnsResolver(
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
  );

  const handlePay = () => {
    console.log(`ENS Name: ${ensName}`);
    console.log("Pay clicked for schemaId:", schemaId);
    if (ensName) {
      alert(
        `Pay clicked for chitty: ${chitty_name} (${ensName}) with schema: ${schemaId}`
      );
    } else {
      alert(
        `Pay clicked for chitty: ${chitty_name} with schema: ${schemaId}`
      );
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border-2 border-gray-800 bg-green-300 p-6 shadow-md shadow-blue-100 text-gray-900">
      <div className="mb-6 space-y-2 text-lg font-medium">
        <div>
          <span className="font-semibold">Chitty Name:</span>{" "}
          <span className="font-normal">{chitty_name}</span>
        </div>
        <div>
          <span className="font-semibold">Time Period:</span>{" "}
          <span className="font-normal">{time_period}</span>
        </div>
        <div>
          <span className="font-semibold">Monthly Amount:</span>{" "}
          <span className="font-normal">₹{monthly_amount}</span>
        </div>
        <div>
          <span className="font-semibold">Contribution:</span>{" "}
          <span className="font-normal">₹{contribute_amount}</span>
        </div>
        <div>
          <span className="font-semibold">Schema ID:</span>{" "}
          <span className="font-normal">{schemaId}</span>
        </div>
      </div>

      <button
        onClick={handlePay}
        className="w-full rounded-lg border-2 border-gray-800 bg-white px-4 py-2 text-lg font-semibold shadow-sm shadow-blue-100 transition hover:bg-gray-100 cursor-pointer"
      >
        Pay
      </button>
    </div>
  );
}

export default PayChittyCard;
