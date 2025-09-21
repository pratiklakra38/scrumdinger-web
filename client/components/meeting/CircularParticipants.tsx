import React from "react";
import type { Attendee } from "../../../shared/api";

interface Props {
  attendees: Attendee[];
  activeIndex: number;
}

export default function CircularParticipants({ attendees, activeIndex }: Props) {
  const radius = 140; // px, outer circle radius for avatars
  const center = { x: 0, y: 0 };
  const size = 40;

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}>
      {/* outer ring visual */}
      <div
        className="absolute rounded-full border-8 border-foreground/20"
        style={{ width: radius * 2, height: radius * 2 }}
      />
      {attendees.map((a, i) => {
        const angle = (i / attendees.length) * Math.PI * 2 - Math.PI / 2;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        const isActive = i === activeIndex;
        return (
          <div
            key={a.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-semibold shadow-md ${
              isActive ? "ring-4 ring-primary scale-110" : "ring-2 ring-foreground/10"
            }`}
            style={{ left: x + radius + 40, top: y + radius + 40, width: size, height: size, backgroundColor: a.color }}
            title={a.name}
          >
            <span className="text-[13px] text-white leading-none select-none">
              {a.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
