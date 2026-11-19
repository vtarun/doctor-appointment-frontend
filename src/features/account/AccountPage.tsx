import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/apiError";
import { useAuthStore } from "@/shared/store/authStore";
import { formStyles as styles } from "@/shared/styles/formStyles";
import type { User } from "@/shared/types";
import { accountQuery } from "./account.api";
import { accountCopy, tabs } from "./account.constant";
import ProfileForm from "./ProfileForm";
import SecurityForm from "./SecurityForm";

function AccountDetails({ user }: { user: User }) {
  const account = useQuery(accountQuery(user.id));
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className={styles.page}>
      <div className={`${styles.card} mx-auto max-w-2xl`}>
        <h1 className={styles.title}>{accountCopy.title}</h1>
        {account.isPending || (!account.data && account.isFetching) ? (
          <p className="mt-6" role="status">{accountCopy.loading}</p>
        ) : !account.data ? (
          <div className="mt-6">
            <p className={styles.error} role="alert">
              {getApiErrorMessage(account.error, accountCopy.loadError)}
            </p>
            <button type="button" className={`${styles.secondaryButton} mt-3`} onClick={() => void account.refetch()}>
              {accountCopy.retry}
            </button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label={accountCopy.tabListLabel} className="my-6 flex gap-2 border-b border-line">
              {tabs.map((tab, index) => (
                <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`}
                  ref={(button) => { buttons.current[index] = button; }}
                  aria-selected={active === index} aria-controls={`${id}-panel-${index}`}
                  tabIndex={active === index ? 0 : -1}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-400 ${active === index ? "border-emerald-400 text-emerald-300" : "border-transparent text-muted-ink"}`}
                  onClick={() => setActive(index)} onKeyDown={(event) => navigateTabs(event, index)}>
                  {tab}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={active !== 0}>
              <ProfileForm saved={account.data} userId={user.id} />
            </div>
            <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={active !== 1}>
              {active === 1 && <SecurityForm />}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  return user && <AccountDetails key={user.id} user={user} />;
}
