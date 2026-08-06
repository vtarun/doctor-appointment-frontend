import { useTransactions } from "@/features/credit/hooks/useTransactions";
import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";
import TransactionList from "@/features/credit/components/TransactionList";
// import { mockTransactions } from "@/mock-data";
const PatientWallet = () => {
  const {
    transactions = [], //mockTransactions,
    isLoading,
    isError,
  } = useTransactions();

  const renderTransactions = () => {
    if(isLoading) return <p>Loading transactions...</p>

    if(isError) return <p role="alert">Unable to load transactions.</p>

    if(transactions.length === 0) return <p>No transactions yet.</p>

    return <TransactionList transactions={transactions} />

    
  }

  return (
    <main>
      <header>
        <h1>Wallet</h1>
        <p>View your available credits and transaction history.</p>
      </header>

      <WalletBalanceCard />

      <section>
        <h2 id="transactions-heading">Transaction history</h2>

        {renderTransactions()}
        
      </section>
    </main>
  );
};

export default PatientWallet;