import { useMemo, useState, type SubmitEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import { doctorApi } from '@/features/doctor/api/doctor.api';
import { availabilityApi } from '@/features/availability/api/availability.api';

import queryClient from '@/shared/lib/queryClient';
import { formatWindow, getErrorMessage, getUtcDayRange, toDateInputValue, tomorrow, toUtcWindow } from '@/shared/utils';

import type { Doctor } from '@/shared/types';
import type { AvailabilityWindow, AvailabilityWindowInput } from '@/features/availability/types';

import './DoctorAvailability.css';


const DoctorAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('19:00');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const range = useMemo(() => getUtcDayRange(selectedDate), [selectedDate]);

  const {data: doctor, isError: isDoctorError, isLoading: isDoctorLoading, error: doctorError} = useQuery<Doctor>({
    queryKey: ['doctor', 'me'],
    queryFn: () => doctorApi.getMyProfile()
  });

  const availabilityQuery = useQuery({
    queryKey: ['doctor-availability', doctor?._id, selectedDate],
    queryFn: () => availabilityApi.getSlots(doctor!._id, range.from, range.to),
    enabled: Boolean(doctor?._id && doctor.verificationStatus === 'VERIFIED'),
    staleTime: 0
  }); 

  const createMutation = useMutation({
    mutationFn: (window: AvailabilityWindowInput) => availabilityApi.createWindow(window),
    onSuccess: (result) => {
      setErrorMessage(null);
      setMessage(result.normalization.excludedMinutes > 0
        ? `Availability saved. ${result.normalization.excludedMinutes} unused minutes were excluded.`
        : 'Availability saved.');
        
      queryClient.invalidateQueries({ queryKey: ['doctor-availability', doctor?._id, selectedDate] });
    },
    onError: (error) => {
      setMessage(null);
      setErrorMessage(getErrorMessage(error));
    }
  });

  const removeMutation = useMutation({
    mutationFn: (window: AvailabilityWindowInput) => availabilityApi.removeRange(window),
    onSuccess: () => {
      setErrorMessage(null);
      setMessage('Availability removed.');
      queryClient.invalidateQueries({ queryKey: ['doctor-availability', doctor?._id, selectedDate] });
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

    if(startTime >= endTime){
      setErrorMessage('End time must be later than start time.');
      return;
    }

    createMutation.mutate(toUtcWindow(selectedDate, startTime, endTime));
  };

  const removeWindow = (window: AvailabilityWindow) => {
    setMessage(null);
    setErrorMessage(null);
    removeMutation.mutate({startTime: window.startTime, endTime: window.endTime});
  };


  if(isDoctorLoading) return <p className="availability-state">Loading doctor profile…</p>;
  if(isDoctorError) return <p className="availability-state availability-error">{getErrorMessage(doctorError)}</p>;

  if(doctor?.verificationStatus !== 'VERIFIED'){
    return (
      <main className="availability-page">
        <Link to="/doctor" className="availability-back">← Dashboard</Link>
        <section className="availability-notice">
          <h1>Availability</h1>
          <p>You can set availability after your doctor profile has been verified.</p>
          <span>Current status: {doctor?.verificationStatus}</span>
        </section>
      </main>
    );
  }

  const windows = availabilityQuery.data?.windows ?? [];

  return (
    <main className="availability-page">
      <Link to="/doctor" className="availability-back">← Dashboard</Link>

      <header className="availability-header">
        <div>
          <p className="availability-eyebrow">Schedule settings</p>
          <h1>Availability</h1>
          <p>Add the times patients can book. Appointments are offered in 30-minute slots.</p>
        </div>
        <label className="date-control">
          <span>Selected date</span>
          <input
            type="date"
            min={toDateInputValue(new Date())}
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setMessage(null);
              setErrorMessage(null);
            }}
          />
        </label>
      </header>

      <div className="availability-layout">
        <section className="availability-card">
          <div className="availability-card-heading">
            <h2>Add a window</h2>
            <p>Overlapping or adjacent windows will be combined automatically.</p>
          </div>

          <form className="availability-form" onSubmit={submitWindow}>
            <label>
              <span>Start time</span>
              <input type="time" step="1800" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
            <label>
              <span>End time</span>
              <input type="time" step="1800" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </label>
            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Add availability'}
            </button>
          </form>

          {message && <p className="availability-feedback success" role="status">{message}</p>}
          {errorMessage && <p className="availability-feedback error" role="alert">{errorMessage}</p>}
        </section>

        <section className="availability-card">
          <div className="availability-card-heading">
            <h2>Saved windows</h2>
            <p>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], {weekday: 'long', day: 'numeric', month: 'long'})}</p>
          </div>

          {availabilityQuery.isLoading && <p className="availability-state">Loading availability…</p>}
          {availabilityQuery.isError && <p className="availability-state availability-error">{getErrorMessage(availabilityQuery.error)}</p>}

          {!availabilityQuery.isLoading && !availabilityQuery.isError && windows.length === 0 && (
            <div className="availability-empty">
              <strong>No availability added</strong>
              <span>Add a window for this date using the form.</span>
            </div>
          )}

          {windows.length > 0 && (
            <ul className="availability-window-list">
              {windows.map((window: AvailabilityWindow) => (
                <li key={window._id}>
                  <div>
                    <strong>{formatWindow(window)}</strong>
                    <span>{Math.round((new Date(window.endTime).getTime() - new Date(window.startTime).getTime()) / 60000)} minutes</span>
                  </div>
                  <button
                    type="button"
                    className="remove-window"
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
    </main>
  );
};

export default DoctorAvailability;