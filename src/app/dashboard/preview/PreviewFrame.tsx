'use client'

import { useState } from 'react'

type Page = { label: string; href: string }

const DEVICES = [
  { label: 'Mobiel', icon: '📱', width: 390, height: 844, scale: 0.7 },
  { label: 'Tablet', icon: '📟', width: 768, height: 1024, scale: 0.65 },
  { label: 'Desktop', icon: '🖥️', width: 1280, height: 800, scale: 0.6 },
]

export default function PreviewFrame({ pages }: { pages: Page[] }) {
  const [device, setDevice] = useState(DEVICES[0])
  const [page, setPage] = useState(pages[0])

  const frameW = device.width
  const frameH = device.height
  const scale = device.scale
  const containerW = Math.round(frameW * scale)
  const containerH = Math.round(frameH * scale)

  return (
    <div className="flex flex-col gap-4 flex-1">

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Paginakiezer */}
        <div className="flex gap-2 flex-wrap">
          {pages.map(p => (
            <button
              key={p.href}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                page.href === p.href
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Apparaatkiezer */}
        <div className="flex gap-2">
          {DEVICES.map(d => (
            <button
              key={d.label}
              onClick={() => setDevice(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                device.label === d.label
                  ? 'bg-[#F47920] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>

        <a
          href={page.href}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-[#1E3A8A] hover:underline"
        >
          Openen in nieuw tabblad ↗
        </a>
      </div>

      {/* Frame */}
      <div className="flex justify-center flex-1 overflow-auto pb-8">
        <div
          className="relative rounded-2xl shadow-2xl border-4 border-gray-200 overflow-hidden bg-white"
          style={{ width: containerW, height: containerH, flexShrink: 0 }}
        >
          <iframe
            src={page.href}
            title={page.label}
            style={{
              width: frameW,
              height: frameH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 'none',
            }}
          />
          {/* Dimensie label */}
          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
            {frameW} × {frameH}
          </div>
        </div>
      </div>
    </div>
  )
}
