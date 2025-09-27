import PayChittyCard from "@/components/PayChittyCard";

const Page = () => {
  const chitties = [
      {
      chitty_name: "Wedding Fund",
      time_period: "12 months",
      monthly_amount: 5000,
      contribute_amount: 1000,
      schemaId: "SCHEMA001",
  },
  {
      chitty_name: "Travel Savings",
      time_period: "6 months",
      monthly_amount: 3000,
      contribute_amount: 1500,
      schemaId: "SCHEMA002",
  },
  {
      chitty_name: "Emergency Fund",
      time_period: "24 months",
      monthly_amount: 2000,
      contribute_amount: 500,
      schemaId: "SCHEMA003",
  },
  {
      chitty_name: "Education Loan Repay",
      time_period: "18 months",
      monthly_amount: 7000,
      contribute_amount: 2000,
      schemaId: "SCHEMA004",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Browse Chitties
        </h1>
        <p className="text-muted-foreground text-lg">
          Join active chitty pools and grow your investments with the community
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {chitties.map((chitty, idx) => (
          <PayChittyCard key={idx} chitty_name={chitty.chitty_name} time_period={chitty.time_period} monthly_amount={chitty.monthly_amount} contribute_amount={chitty.contribute_amount} schemaId={chitty.schemaId}/>
        ))}
      </div>
    </div>
  );
};

export default Page;