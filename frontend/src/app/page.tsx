import Image from "next/image";
import JoinChittyCard from "./components/JoinChittyCard";
import ChittySchemeCard from "./components/ChittySchemeCard";
import BidModalDemo from "./components/BidModalDemo";
import ChittyWinnerModalDemo from "./components/ChittyWinnerModalDemo";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* <JoinChittyCard chitty_name={"ksfe"} owner={""} totalCycles={0} monthly_amount={0} contribute_amount={0}/> */}
      <ChittySchemeCard/>
      {/* <BidModalDemo/> */}
      <ChittyWinnerModalDemo/>
    </div>
  );
}
