"use client";

import * as echarts from "echarts";
import { useEffect, useRef, type CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/utils";

export function EChart({ option, ariaLabel, className, style }: { option: EChartsOption; ariaLabel: string; className?: string; style?: CSSProperties }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!element.current) return;
    const chart = echarts.init(element.current);
    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(element.current);
    return () => { observer.disconnect(); chart.dispose(); };
  }, [option]);
  return <div ref={element} role="img" aria-label={ariaLabel} className={cn("h-80 w-full", className)} style={style} />;
}
