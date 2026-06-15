import { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { ArrowLeftRight, Sparkles, Wand2 } from 'lucide-react';

import whiteningBefore from '../assets/images/whitening_before_1779622080110.png';
import whiteningAfter from '../assets/images/whitening_after_1779622100034.png';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    
    // Bounds check
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    setSliderPosition(position);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <section id="results" className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
            <span>Interactive Aesthetic Preview</span>
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 font-sans sm:text-4xl">
            Interactive Smile Transformations
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Drag the sliding handle horizontally to witness our cosmetic veneers and advanced orthodontic realignments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Detailed explanations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-4 font-semibold">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Porcelain Aesthetic Overlays</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Our custom thin dental porcelain coverings are shade-matched to skin tones to ensure teeth look pristine, luminous, and natural.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-4 font-semibold">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Elite Invisalign Aligners</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Aligning crowded teeth seamlessly with comfortable clear aligners without annoying metal brackets. Full smile symmetry with zero dietary bans.
              </p>
            </div>

            <div className="bg-white/40 p-5 rounded-2xl border border-dashed border-slate-200">
              <span className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider">
                <Wand2 className="h-4 w-4 text-teal-600" /> Clinical Success Metric
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Each crown is verified with our 3D microscope and computerized occlusion test maps ensuring standard biting force.
              </p>
            </div>
          </div>

          {/* Interactive Sliding Area */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div 
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handleTouchMove}
              id="before-after-card"
              className="relative h-[280px] w-full max-w-[580px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl select-none cursor-ew-resize border-4 border-white bg-slate-200"
            >
              {/* After Image (Full width background) */}
              <img
                src={whiteningAfter}
                alt="After professional whitening"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 z-10 rounded-md bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 text-2xs font-extrabold uppercase tracking-widest text-white leading-none">
                After: Luminous Restoration
              </div>

              {/* Before Image (Cropped foreground based on percentage slider) */}
              <div 
                className="absolute inset-y-0 left-0 overflow-hidden" 
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={whiteningBefore}
                  alt="Before tooth adjustment"
                  // Must use explicit width to maintain correct crop aspect ratio
                  className="pointer-events-none absolute inset-y-0 left-0 h-full object-cover max-w-none"
                  style={{ width: containerRef.current?.getBoundingClientRect().width || 580 }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 z-10 rounded-md bg-slate-800/90 backdrop-blur-xs px-2.5 py-1 text-2xs font-extrabold uppercase tracking-widest text-white leading-none">
                  Before Treatment
                </div>
              </div>

              {/* Sliding Bar Divider and Handle */}
              <div 
                className="absolute inset-y-0 z-20 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-[45%] -left-5 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-teal-600 text-teal-600 shadow-md">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center flex items-center gap-1.5">
              <span>Touch and drag slider handle left/right to compare</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
