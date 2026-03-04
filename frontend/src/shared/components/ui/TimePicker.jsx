// frontend/src/components/shared/TimePicker.jsx
import React, { useState, useRef, useEffect } from 'react';

const pad = (n) => String(n).padStart(2, '0');

const parseTime = (value) => {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  return { hours: h, minutes: m };
};

const toValue = (h, m) => `${pad(h)}:${pad(m)}`;

const TimePicker = ({
  label,
  value,
  onChange,
  format = '24',          // '12' or '24'
  minuteStep = 1,
  min,
  max,
  disabled = false,
  className = '',
}) => {
  const is12h = format === '12';
  const wrapperRef = useRef(null);

  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(parsed?.hours ?? 12);
  const [minutes, setMinutes] = useState(parsed?.minutes ?? 0);
  const [period, setPeriod] = useState(hours >= 12 ? 'PM' : 'AM');

  // Sync external value
  useEffect(() => {
    if (!parsed) return;
    setHours(parsed.hours);
    setMinutes(parsed.minutes);
    setPeriod(parsed.hours >= 12 ? 'PM' : 'AM');
  }, [value]);

  // Click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyChange = (h, m, p = period) => {
    let finalHour = h;

    if (is12h) {
      if (p === 'PM' && h < 12) finalHour += 12;
      if (p === 'AM' && h === 12) finalHour = 0;
    }

    const newValue = toValue(finalHour, m);

    if (min && newValue < min) return;
    if (max && newValue > max) return;

    onChange?.(newValue);
  };

  const displayValue = () => {
    if (!value) return '--:--';

    if (!is12h) return value;

    let h = parsed.hours;
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;

    return `${pad(h)}:${pad(parsed.minutes)} ${p}`;
  };

  const hoursList = is12h
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);

  const minutesList = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep
  );

  return (
    <div ref={wrapperRef} className={`timepicker ${className}`}>
      {label && <label className="timepicker-label">{label}</label>}

      <button
        type="button"
        className="timepicker-input"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {displayValue()}
      </button>

      {open && !disabled && (
        <div className="timepicker-panel">
          <div className="timepicker-columns">
            <div className="timepicker-column">
              {hoursList.map((h) => (
                <button
                  key={h}
                  className={h === (is12h ? (hours % 12 || 12) : hours) ? 'active' : ''}
                  onClick={() => {
                    setHours(h);
                    applyChange(h, minutes);
                  }}
                >
                  {pad(h)}
                </button>
              ))}
            </div>

            <div className="timepicker-column">
              {minutesList.map((m) => (
                <button
                  key={m}
                  className={m === minutes ? 'active' : ''}
                  onClick={() => {
                    setMinutes(m);
                    applyChange(hours, m);
                  }}
                >
                  {pad(m)}
                </button>
              ))}
            </div>

            {is12h && (
              <div className="timepicker-column">
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    className={p === period ? 'active' : ''}
                    onClick={() => {
                      setPeriod(p);
                      applyChange(hours, minutes, p);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
