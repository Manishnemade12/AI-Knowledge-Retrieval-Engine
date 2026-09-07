import { BrainCircuit } from 'lucide-react';

export default function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-[#d8f75b] text-[#172014] shadow-[0_0_0_5px_rgba(216,247,91,0.08)]">
        <BrainCircuit size={21} strokeWidth={2.4} />
      </div>
      <div>
        <p className="font-display text-[15px] font-semibold tracking-tight text-[#f5f4ee]">Lumen</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#81877c]">study intelligence</p>
      </div>
    </div>
  );
}
