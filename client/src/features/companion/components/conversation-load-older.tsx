import { useEffect, useRef, useState } from 'react';

import { useStickToBottomContext } from 'use-stick-to-bottom';

import { Spinner } from '@/components/ui/spinner';

export function ConversationLoadOlder({
  onLoadOlder,
  isLoading,
}: {
  onLoadOlder?: (() => void) | undefined;
  isLoading: boolean;
}) {
  const { scrollRef } = useStickToBottomContext();
  const [atTop, setAtTop] = useState(false);
  const prevHeightRef = useRef(0);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const handleScroll = () => {
      setAtTop(element.scrollTop <= 1);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  useEffect(() => {
    if (atTop && !isLoading && onLoadOlder) {
      const element = scrollRef.current;
      prevHeightRef.current = element?.scrollHeight ?? 0;
      onLoadOlder();
    }
  }, [atTop, isLoading, onLoadOlder, scrollRef]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      const element = scrollRef.current;
      if (element && prevHeightRef.current > 0) {
        element.scrollTop += element.scrollHeight - prevHeightRef.current;
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, scrollRef]);

  if (!isLoading) return null;

  return (
    <output className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/80 p-2 shadow-sm backdrop-blur-sm">
      <Spinner className="size-4" />
    </output>
  );
}
