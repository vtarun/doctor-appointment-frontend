import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { NavbarRoleBasedLinks } from "../constants";
import { useAuthStore } from "../store/authStore";
import type { UserRoleType } from "../types";
import Avatar from "./Avatar";

const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";
const menuItem = "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-emerald-950 focus:bg-emerald-950 " + focusStyle;

interface NavbarProps {
  role: UserRoleType;
  name?: string;
  photo?: string | null;
}

export default function Navbar({ role, name = "Account", photo }: NavbarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const openingIndex = useRef(0);

  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    items?.[openingIndex.current]?.focus();

    function dismissOutside(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false);
        button.current?.focus();
      }
    }

    document.addEventListener("click", dismissOutside);
    return () => document.removeEventListener("click", dismissOutside);
  }, [open]);

  function dismiss(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) button.current?.focus();
  }

  function handleMenuKeys(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        dismiss();
        break;
      case "Tab":
        // Start native Tab navigation from the trigger so focus can leave in either direction.
        dismiss();
        break;
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End": {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 :
          (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
        break;
      }
    }
  }

  return (
    <header className="border-b border-line bg-panel">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <NavLink to="/" className={`shrink-0 rounded-sm font-bold text-emerald-300 ${focusStyle}`}>MediBuddy</NavLink>
        <ul className="order-last flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:order-0 sm:w-auto sm:flex-1">
          {NavbarRoleBasedLinks[role].map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} end={role !== "ADMIN" && to === NavbarRoleBasedLinks[role][0]?.to}
                className={({ isActive }) => `inline-block rounded-sm py-1 ${focusStyle} ${isActive ? "text-emerald-300 underline underline-offset-4" : "text-muted-ink hover:text-ink"}`}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="relative ml-auto min-w-0 max-w-[62%] sm:max-w-56" ref={container}>
          <button type="button" ref={button} aria-label={`Account menu for ${name}`} aria-haspopup="menu"
            aria-expanded={open} aria-controls={open ? menuId : undefined}
            className={`flex w-full cursor-pointer items-center gap-2 rounded-full py-1 pr-1 pl-2 text-sm ${focusStyle}`}
            onClick={() => {
              if (open) dismiss();
              else {
                openingIndex.current = 0;
                setOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                openingIndex.current = event.key === "ArrowUp" ? 1 : 0;
                if (open) menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[openingIndex.current]?.focus();
                else setOpen(true);
              } else if (event.key === "Escape" && open) {
                dismiss();
              }
            }}>
            <span className="min-w-0 truncate" title={name}>{name}</span>
            <Avatar name={name} src={photo} className="size-9 text-xs" />
          </button>
          {open && (
            <div ref={menu} id={menuId} role="menu" aria-label="Account" onKeyDown={handleMenuKeys}
              className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-line bg-panel p-1.5 shadow-lg shadow-black/30">
              <Link role="menuitem" tabIndex={-1} className={menuItem} to={ROUTES.account} onClick={() => dismiss()}>Manage account</Link>
              <button type="button" role="menuitem" tabIndex={-1} className={menuItem} onClick={() => {
                dismiss();
                logout();
                navigate(ROUTES.login, { replace: true });
              }}>Sign out</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
