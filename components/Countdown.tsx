'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getTimeUntilMidnight, padTwo } from '@/lib/utils';

export default function Countdown() {
  const [time, setTime] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsLeft = time.hours * 3600 + time.minutes * 60 + time.seconds;
  const isUrgent = secondsLeft < 3600;

  return (
    <span
      className={`badge badge-gold${isUrgent ? ' animate-streak' : ''}`}
      style={{ padding: '8px 16px', fontSize: '0.9375rem', gap: '5px' }}
    >
      <Clock size={13} />
      {padTwo(time.hours)}:{padTwo(time.minutes)}:{padTwo(time.seconds)} left
    </span>
  );
}
