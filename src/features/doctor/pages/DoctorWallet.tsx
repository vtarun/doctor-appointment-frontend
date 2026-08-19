import axios from 'axios';
import { useState, type SubmitEventHandler } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { earningsApi } from '../api/earnings.api';
import type { CreditTransaction, PayoutRequestInput } from '../types';
import queryClient from '@/shared/lib/queryClient';

import './DoctorWallet.css';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const dateTime = new Intl.DateTimeFormat([], {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
};

const transactionLabels = {
  ALLOCATE: 'Credits allocated',
  BOOKING_DEBIT: 'Appointment booked',
  BOOKING_EARNING: 'Appointment earning',
  CANCELLATION_REFUND: 'Cancellation refund',
  CANCELLATION_REVERSAL: 'Earning reversed',
  PAYOUT_DEDUC: 'Payout requested'
} as const;

const DoctorWallet = () => {
  const [paypalEmail, setPaypalEmail] = useState('');
  const [creditsRequested, setCreditsRequested] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ['payouts', 'me', 'summary'],
    queryFn: earningsApi.getSummary
  });

  const {data: transactions = [], isError: isTransactionsError, isLoading: isTransactionsLoading, error} = useQuery<CreditTransaction[]>({
    queryKey: ['transactions', 'me'],
    queryFn: earningsApi.getTransactions
  });

  const payoutMutation = useMutation({
    mutationFn: (input: PayoutRequestInput) => earningsApi.requestPayout(input),
    onSuccess: async () => {
      setFeedback('Payout request submitted.');
      setCreditsRequested('');
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['payouts', 'me', 'summary']}),
        queryClient.invalidateQueries({queryKey: ['transactions', 'me']})
      ]);
    },
    onError: () => setFeedback(null)
  });

  const submitPayout: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFeedback(null);

    const credits = Number(creditsRequested);
    if (!Number.isInteger(credits) || credits < 1) return;

    payoutMutation.mutate({paypalEmail: paypalEmail.trim(), creditsRequested: credits});
  };

  if (summaryQuery.isLoading) {
    return <p className="wallet-state">Loading earnings…</p>;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <p className="wallet-state wallet-error" role="alert">{getErrorMessage(summaryQuery.error)}</p>;
  }

  const summary = summaryQuery.data;
  // const transactions = transactionsQuery.data as CreditTransaction[];
  const requestedCredits = Number(creditsRequested);
  const invalidAmount = creditsRequested !== '' && (
    !Number.isInteger(requestedCredits) ||
    requestedCredits < 1 ||
    requestedCredits > summary.availableCredits
  );
  const cannotRequest = Boolean(summary.processingRequest) || summary.availableCredits < 1;

  return (
    <main className="doctor-wallet">
      <Link to="/doctor" className="wallet-back">← Dashboard</Link>

      <header className="wallet-header">
        <div>
          <p className="wallet-eyebrow">Doctor earnings</p>
          <h1>Wallet and payouts</h1>
          <p>Review available credits, payout estimates, and transaction history.</p>
        </div>
      </header>

      <section className="wallet-summary" aria-label="Earnings summary">
        <article className="balance-card balance-card-primary">
          <span>Available credits</span>
          <strong>{summary.availableCredits.toLocaleString()}</strong>
          <small>Eligible for payout</small>
        </article>
        {/* <article className="balance-card">
          <span>Estimated gross</span>
          <strong>{currency.format(summary.estimatedGrossAmount)}</strong>
          <small>Before platform fee</small>
        </article>
        <article className="balance-card">
          <span>Platform fee</span>
          <strong>{currency.format(summary.estimatedFeeAmount)}</strong>
          <small>Estimated deduction</small>
        </article> */}
        <article className="balance-card">
          <span>Estimated payout</span>
          <strong>{currency.format(summary.estimatedNetAmount)}</strong>
          <small>Net amount</small>
        </article>
      </section>

      <div className="wallet-layout">
        <section className="wallet-card">
          <div className="wallet-card-heading">
            <h2>Request payout</h2>
            <p>Credits are reserved as soon as the request is submitted.</p>
          </div>

          {summary.processingRequest ? (
            <div className="active-payout">
              <span className="status-pill processing">Processing</span>
              <strong>{summary.processingRequest.creditsRequested} credits</strong>
              <p>{currency.format(summary.processingRequest.netAmount)} estimated net payout</p>
              <small>Requested {dateTime.format(new Date(summary.processingRequest.createdAt))}</small>
            </div>
          ) : (
            <form className="payout-form" onSubmit={submitPayout}>
              <label>
                <span>PayPal email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={paypalEmail}
                  onChange={(event) => setPaypalEmail(event.target.value)}
                  placeholder="doctor@example.com"
                />
              </label>
              <label>
                <span>Credits to withdraw</span>
                <input
                  type="number"
                  required
                  min="1"
                  max={summary.availableCredits}
                  step="1"
                  value={creditsRequested}
                  onChange={(event) => setCreditsRequested(event.target.value)}
                />
                <small>Maximum {summary.availableCredits.toLocaleString()} credits</small>
              </label>
              {invalidAmount && <p className="wallet-feedback error" role="alert">Enter a whole number within your available balance.</p>}
              <button type="submit" disabled={cannotRequest || invalidAmount || payoutMutation.isPending}>
                {payoutMutation.isPending ? 'Submitting…' : 'Request payout'}
              </button>
            </form>
          )}

          {feedback && <p className="wallet-feedback success" role="status">{feedback}</p>}
          {payoutMutation.isError && <p className="wallet-feedback error" role="alert">{getErrorMessage(payoutMutation.error)}</p>}
        </section>

        <section className="wallet-card">
          <div className="wallet-card-heading">
            <h2>Payout history</h2>
            <p>{summary.history.length} request{summary.history.length === 1 ? '' : 's'}</p>
          </div>
          {summary.history.length === 0 ? (
            <p className="wallet-empty">No payout requests yet.</p>
          ) : (
            <ul className="payout-list">
              {summary.history.map((payout) => (
                <li key={payout._id}>
                  <div>
                    <strong>{payout.creditsRequested} credits</strong>
                    <span>{dateTime.format(new Date(payout.createdAt))}</span>
                  </div>
                  <div className="payout-list-end">
                    <strong>{currency.format(payout.netAmount)}</strong>
                    <span className={`status-pill ${payout.status.toLowerCase()}`}>{payout.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="wallet-card transaction-card">
        <div className="wallet-card-heading">
          <h2>Credit transactions</h2>
          <p>Append-only history of wallet changes</p>
        </div>
        {isTransactionsLoading && <p className="wallet-empty">Loading transactions…</p>}
        {isTransactionsError && <p className="wallet-feedback error" role="alert">{getErrorMessage(error)}</p>}
        {transactions?.length === 0 && <p className="wallet-empty">No transactions yet.</p>}
        {transactions && transactions.length > 0 && (
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li key={transaction._id}>
                <div>
                  <strong>{transactionLabels[transaction.type]}</strong>
                  <span>{dateTime.format(new Date(transaction.createdAt))}</span>
                </div>
                <div className="transaction-amount">
                  <strong className={transaction.amount >= 0 ? 'credit' : 'debit'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                  </strong>
                  <span>Balance {transaction.balanceAfter}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default DoctorWallet;
