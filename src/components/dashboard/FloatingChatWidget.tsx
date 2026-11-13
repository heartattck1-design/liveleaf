import { useRef, useState, type PointerEvent } from 'react';
import { Bot, Grip, X } from 'lucide-react';

import { AiChatPanel } from './AiChatPanel';

interface FloatingChatWidgetProps {
  theme: 'light' | 'dark';
}

interface DragStart {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  right: number;
  bottom: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function FloatingChatWidget({ theme }: FloatingChatWidgetProps) {
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ right: 24, bottom: 88 });
  const dragStart = useRef<DragStart | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStart.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      right: position.right,
      bottom: position.bottom,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const panel = panelRef.current;
    const width = panel?.getBoundingClientRect().width ?? 416;
    const height = panel?.getBoundingClientRect().height ?? 640;
    const maxRight = Math.max(8, window.innerWidth - width - 8);
    const maxBottom = Math.max(8, window.innerHeight - height - 8);
    setPosition({
      right: clamp(start.right - (event.clientX - start.pointerX), 8, maxRight),
      bottom: clamp(start.bottom + (event.clientY - start.pointerY), 8, maxBottom),
    });
  };

  const stopDragging = () => {
    dragStart.current = null;
  };

  return (
    <>
      <div
        ref={panelRef}
        aria-label="LiveLeaf chat window"
        className={[
          isOpen ? 'fixed z-40 flex flex-col overflow-hidden rounded-3xl border shadow-2xl' : 'hidden',
          isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
        ].join(' ')}
        style={{
          right: position.right,
          bottom: position.bottom,
          width: 'min(26rem, calc(100vw - 2rem))',
          height: 'min(42rem, calc(100vh - 7rem))',
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-700/15 px-3 py-2.5">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            className="flex min-w-0 flex-1 touch-none cursor-grab items-center gap-2 active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <Grip className="h-4 w-4 shrink-0 text-slate-400" />
            <Bot className="h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">LiveLeaf Assistant</p>
              <p className="text-[11px] text-slate-500">Drag here to move</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <AiChatPanel theme={theme} />
        </div>
      </div>

      <button
        type="button"
        aria-label={isOpen ? 'Close LiveLeaf chat' : 'Open LiveLeaf chat'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </>
  );
}
