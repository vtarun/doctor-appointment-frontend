import type { Transaction, TransactionType } from "@/shared/types"

interface TransactionListProps{
    transactions: Transaction[]
}

const creditTypes: TransactionType[] = [
  "ALLOCATE",
  "CANCELLATION_REFUND",
];

const transactionLabels: Record<TransactionType, string> = {
  ALLOCATE: "Monthly credit allocation",
  BOOKING_DEBIT: "Consultation booking",
  BOOKING_EARNING: "Consultation earning",
  CANCELLATION_REFUND: "Cancellation refund",
  CANCELLATION_REVERSAL: "Cancellation reversal",
  PAYOUT_DEDUCTION: "Payout deduction",
};

const TransactionList = ({transactions}: TransactionListProps) => {
  return (
    <ul>
      {transactions.map((transaction) => {
          const isCredit = creditTypes.includes(transaction.type);
          const doctorName =
            typeof transaction.meta.doctorName === "string"
              ? transaction.meta.doctorName
              : null;

          return (
            <li className="transaction-item" key={transaction._id}>
              <div className="transaction-details">
                <p className="transaction-description">
                  <strong>{transactionLabels[transaction.type]}</strong>

                  {doctorName && <span> · {doctorName}</span>}
                </p>

                <time dateTime={transaction.createdAt}>
                  {new Date(transaction.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </time>
              </div>

              <div className="transaction-amount-details">
                <strong className={isCredit ? "credit" : "debit"}>
                  {isCredit ? "+" : "−"}₹
                  {transaction.amount.toLocaleString("en-IN")}
                </strong>

                <span>
                  Balance: ₹
                  {transaction.balanceAfter.toLocaleString("en-IN")}
                </span>
              </div>
            </li>
          );
        })}
    </ul>
  )
}

export default TransactionList
