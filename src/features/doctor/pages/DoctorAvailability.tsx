import { useMemo, useState, type SubmitEventHandler } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { doctorApi } from "@/features/doctor/api/doctor.api";
import { availabilityApi } from "@/features/availability/api/availability.api";
import queryClient from "@/shared/lib/queryClient";
import { formStyles as ui } from "@/shared/styles/formStyles";
import {
  formatWindow,
  getErrorMessage,
  getUtcDayRange,
  toDateInputValue,
  tomorrow,
  toUtcWindow
} from "@/shared/utils";

import type { Doctor } from "@/shared/types";
import type {
  AvailabilityWindow,
  AvailabilityWindowInput
} from "@/features/availability/types";

const DoctorAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("19:00");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const range = useMemo(() => getUtcDayRange(selectedDate), [selectedDate]);

  const {
    data: doctor,
    isError: isDoctorError,
    isLoading: isDoctorLoading,
    error: doctorError
  } = useQuery<Doctor>({
    queryKey: ["doctor", "me"],
    queryFn: () => doctorApi.getMyProfile()
  });

  const availabilityQuery = useQuery({
    queryKey: ["doctor-availability", doctor?._id, selectedDate],
    queryFn: () =>
      availabilityApi.getSlots(doctor!._id, range.from, range.to),
    enabled: Boolean(
      doctor?._id && doctor.verificationStatus === "VERIFIED"
    ),
    staleTime: 0
  });

  const createMutation = useMutation({
    mutationFn: (window: AvailabilityWindowInput) =>
      availabilityApi.createWindow(window),

    onSuccess: (result) => {
      setErrorMessage(null);
      setMessage(
        result.normalization.excludedMinutes > 0
          ? `Availability saved. ${result.normalization.excludedMinutes} unused minutes were excluded.`
          : "Availability saved."
      );

      queryClient.invalidateQueries({
        queryKey: ["doctor-availability", doctor?._id, selectedDate]
      });
    },

    onError: (error) => {
      setMessage(null);
      setErrorMessage(getErrorMessage(error));
    }
  });

  const removeMutation = useMutation({
    mutationFn: (window: AvailabilityWindowInput) =>
      availabilityApi.removeRange(window),

    onSuccess: () => {
      setErrorMessage(null);
      setMessage("Availability removed.");

      queryClient.invalidateQueries({
        queryKey: ["doctor-availability", doctor?._id, selectedDate]
      });
    },

    onError: (error) => {
      setMessage(null);
      setErrorMessage(getErrorMessage(error));
    }
  });

  const submitWindow: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (startTime >= endTime) {
      setErrorMessage("End time must be later than start time.");
      return;
    }

    createMutation.mutate(toUtcWindow(selectedDate, startTime, endTime));
  };

  const removeWindow = (window: AvailabilityWindow) => {
    setMessage(null);
    setErrorMessage(null);

    removeMutation.mutate({
      startTime: window.startTime,
      endTime: window.endTime
    });
  };

  if (isDoctorLoading) {
    return (
      <main className={ui.page}>
        <p className="mx-auto max-w-5xl text-sm text-muted-ink">
          Loading doctor profile...
        </p>
      </main>
    );
  }

  if (isDoctorError) {
    return (
      <main className={ui.page}>
        <p className={`${ui.error} mx-auto max-w-5xl`} role="alert">
          {getErrorMessage(doctorError)}
        </p>
      </main>
    );
  }

  if (doctor?.verificationStatus !== "VERIFIED") {
    return (
      <main className={ui.page}>
        <div className="mx-auto max-w-5xl">
          <Link
            to="/doctor"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            ← Dashboard
          </Link>

          <section className={`${ui.card} mt-8 max-w-2xl`}>
            <h1 className={ui.title}>Availability</h1>
            <p className="mt-4 leading-7 text-muted-ink">
              You can set availability after your doctor profile has been
              verified.
            </p>
            <p className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink">
              Current status:{" "}
              <span className="font-semibold text-amber-300">
                {doctor?.verificationStatus}
              </span>
            </p>
          </section>
        </div>
      </main>
    );
  }

  const windows = availabilityQuery.data?.windows ?? [];

  return (
    <main className={ui.page}>
      <div className="mx-auto max-w-5xl">
        <Link
          to="/doctor"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Dashboard
        </Link>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Schedule settings
            </p>
            <h1 className={ui.title}>Availability</h1>
            <p className={ui.subtitle}>
              Add the times patients can book. Appointments are offered
              in 30-minute slots.
            </p>
          </div>

          <div className="w-full sm:w-48">
            <label className={ui.label} htmlFor="availability-date">
              Selected date
            </label>
            <input
              id="availability-date"
              type="date"
              className={ui.input}
              min={toDateInputValue(new Date())}
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setMessage(null);
                setErrorMessage(null);
              }}
            />
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className={`${ui.card} self-start`}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ink">
                Add a window
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                Overlapping or adjacent windows will be combined
                automatically.
              </p>
            </div>

            <form className="space-y-5" onSubmit={submitWindow}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ui.label} htmlFor="start-time">
                    Start time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    step="1800"
                    className={ui.input}
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={ui.label} htmlFor="end-time">
                    End time
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    step="1800"
                    className={ui.input}
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(event.target.value)
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className={`${ui.primaryButton} w-full`}
              >
                {createMutation.isPending
                  ? "Saving..."
                  : "Add availability"}
              </button>
            </form>

            {message && (
              <p className={ui.success} role="status">
                {message}
              </p>
            )}

            {errorMessage && (
              <p className={ui.error} role="alert">
                {errorMessage}
              </p>
            )}
          </section>

          <section className={ui.card}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ink">
                Saved windows
              </h2>
              <p className="mt-2 text-sm text-muted-ink">
                {new Date(
                  `${selectedDate}T00:00:00`
                ).toLocaleDateString([], {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })}
              </p>
            </div>

            {availabilityQuery.isLoading && (
              <p className="text-sm text-muted-ink">
                Loading availability...
              </p>
            )}

            {availabilityQuery.isError && (
              <p className={ui.error} role="alert">
                {getErrorMessage(availabilityQuery.error)}
              </p>
            )}

            {!availabilityQuery.isLoading &&
              !availabilityQuery.isError &&
              windows.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface p-6">
                  <strong className="block text-sm text-ink">
                    No availability added
                  </strong>
                  <span className="mt-2 block text-sm text-muted-ink">
                    Add a window for this date using the form.
                  </span>
                </div>
              )}

            {windows.length > 0 && (
              <ul className="space-y-3">
                {windows.map((window: AvailabilityWindow) => (
                  <li
                    key={window._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                  >
                    <div>
                      <strong className="block text-sm font-semibold text-emerald-300">
                        {formatWindow(window)}
                      </strong>
                      <span className="mt-1 block text-xs text-muted-ink">
                        {Math.round(
                          (new Date(window.endTime).getTime() -
                            new Date(window.startTime).getTime()) /
                            60000
                        )}{" "}
                        minutes
                      </span>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-red-900/50 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/30 disabled:opacity-50"
                      disabled={removeMutation.isPending}
                      onClick={() => removeWindow(window)}
                      aria-label={`Remove availability ${formatWindow(window)}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default DoctorAvailability;