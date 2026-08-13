"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowsClockwise,
  ImageSquare,
  Eraser,
  Scissors,
  DownloadSimple,
  FilePdf,
  TextT,
  Hash,
  Lock,
  Eyedropper,
  QrCode,
  Barcode,
  Images,
} from "@phosphor-icons/react";

const ICONS: Record<string, React.ElementType> = {
  ArrowsClockwise,
  ImageSquare,
  Eraser,
  Scissors,
  DownloadSimple,
  FilePdf,
  TextT,
  Hash,
  Lock,
  Eyedropper,
  QrCode,
  Barcode,
  Images,
};

export interface Tool {
  href: string;
  icon: string;
  label: string;
  desc: string;
}

interface Props {
  tools: Tool[];
  color: string;
}

export default function ToolGrid({ tools, color }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {tools.map((tool) => {
        const Icon = ICONS[tool.icon] ?? ArrowRight;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = color + "50";
              el.style.background = color + "08";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border)";
              el.style.background = "var(--surface)";
            }}
          >
            <span
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: color + "20" }}
            >
              <Icon size={20} weight="duotone" color={color} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                  {tool.label}
                </span>
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color }}
                />
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-2)" }}>
                {tool.desc}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
