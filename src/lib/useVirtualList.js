import { useState, useRef, useCallback } from "react";

/**
 * Virtual list for long exercise lists.
 * itemHeight: estimated px per row (use 58 for ExercisePicker rows)
 * containerHeight: visible container px
 * overscan: extra rows to render above/below visible area
 */
export function useVirtualList({ items, itemHeight = 58, containerHeight = 480, overscan = 6 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems = items.slice(visibleStart, visibleEnd).map((item, i) => ({
    item,
    index: visibleStart + i,
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return { visibleItems, totalHeight, offsetY, onScroll };
}
