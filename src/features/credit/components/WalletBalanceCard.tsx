import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";

const WalletBalanceCard = () => {
  const { wallet, isLoading, isError } = useWallet();

  const renderBalanceState = () => {
    if (isLoading) {
      return <p>Loading balance...</p>;
    }

    if (isError) {
      return <p role="alert">Unable to load balance.</p>;
    }

    const currentBalance = wallet?.balance ?? 0;
    
    return (
      <strong>
        ₹{currentBalance.toLocaleString("en-IN")}
      </strong>
    );
  };

  return (
    <article className="card">
      <p>Wallet balance</p>
      
      {renderBalanceState()}

      <Link to="/patient/wallet">View wallet</Link>
    </article>
  );
};

export default WalletBalanceCard;