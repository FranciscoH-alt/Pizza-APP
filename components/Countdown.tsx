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

  return (
    <span className="badge badge-gold">
      <Clock size={11} />
      {padTwo(time.hours)}:{padTwo(time.minutes)}:{padTwo(time.seconds)} left
    </span>
  );
}
