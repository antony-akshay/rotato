import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

const Header = () => {

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto p-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">Rotato</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button>
            <Link href="/mychits" className="flex items-center gap-2">
              My Chits
            </Link>
          </Button>

          <div>
              <ConnectButton chainStatus="none"/>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;