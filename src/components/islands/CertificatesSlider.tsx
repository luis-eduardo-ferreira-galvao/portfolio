import React, { useState, useEffect } from 'react';

export interface Certificate {
    id: number;
    title: string;
    issuer: string;
    description: string;
    date: string;
    image?: string; // URL to the certificate image
    link?: string; // URL to verify
}

interface CertificatesSliderProps {
    certificates: Certificate[];
}

export default function CertificatesSlider({ certificates }: CertificatesSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | null>(null);

    // Minimum swipe distance (in px) 
    const minSwipeDistance = 50;

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % certificates.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    // Mouse drag handlers for desktop "swipe"
    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        /* Optional: Add visual feedback for dragging here if desired */
    };

    const onMouseUp = (e: React.MouseEvent) => {
        if (!isDragging || dragStartX === null) return;

        const dragEndX = e.clientX;
        const distance = dragStartX - dragEndX;

        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }

        setIsDragging(false);
        setDragStartX(null);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
        setDragStartX(null);
    };

    // Calculate styles for the carousel items
    const getCardStyle = (index: number) => {
        // We want a circular buffer effect for visualization if we have enough items, 
        // but for a simple "coverflow" centered approach, we can just calculate distance.
        // However, standard coverflow doesn't loop visually usually, but let's make it loop logic-wise.

        // Find the relative position in a circular way is tricky for style interpolation without duplicating DOM.
        // Let's stick to a simpler 3D stack approach where we map the items reasonably.
        // Actually, let's just use the direct difference for simplicity.

        let diff = index - activeIndex;

        // Handle wrapping for nice transitions if list is long? 
        // For < 5 items, wrapping visual logic is hard. Let's just do direct distance for now.
        // If we want infinite loop visual, we need virtual slides. Let's keep it simple: Finite scroll or wrap logic on the index but distinct positions.
        // Actually the image shows a "selected" one and others fading/turning.

        // To handle the visual "wrapping" (where the first item appears after the last), we'd need more complex logic.
        // Detailed approach: Just center the activeIndex. Data loops.

        // Let's try to make the index relative to the active one, normalizing for the array length to find the "shortest path" visually?
        // No, standard coverflow is easiest if we render a window around the active index.
        // Let's render ALL items but position them based on `diff`.

        // Determine "visual" distance (handling wrap-around could be confusing without cloning). 
        // Let's just do standard clamping or simple difference.
        // If index is 0 and active is 4 (in 5 items), diff is -4. But visually it should be +1? 
        // Let's ignore wrap-around visual for a second and just do simple list. The user can click next/prev.

        // BETTER: Use a fixed window of indices to render, e.g. [active-2, active-1, active, active+1, active+2].
        // But for React unique keys, it's safer to map the whole list and transform them.

        const total = certificates.length;
        // Adjust diff to be the shortest path in the circle?
        // e.g. if total 5, active 0, index 4 -> diff should be -1.
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        const isActive = diff === 0;
        const xOffset = diff * 120; // Distance between cards
        const zOffset = -Math.abs(diff) * 100; // Depth
        const rotateY = diff > 0 ? -45 : diff < 0 ? 45 : 0;
        const opacity = Math.max(1 - Math.abs(diff) * 0.3, 0);
        const zIndex = 100 - Math.abs(diff);
        const scale = isActive ? 1.0 : 0.8;

        // Visibility check to prevent weird overlaps from far away items
        const isVisible = Math.abs(diff) <= 2;

        return {
            transform: `translateX(${xOffset}%) translateZ(${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`,
            zIndex: zIndex,
            opacity: isVisible ? opacity : 0,
            transition: 'all 0.5s ease-in-out',
            display: isVisible ? 'block' : 'none', // Simple optimization
        };
    };

    const activeCert = certificates[activeIndex];

    return (
        <div className="w-full text-slate-100 p-4 md:p-10">
            {/* Top Section */}
            <div className="flex flex-col lg:flex-row gap-12 mb-20 lg:min-h-[300px]">
                {/* Left: Title & Intro */}
                <div className="flex-1 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-serif tracking-tight leading-none">
                        <span className="block text-white">Credentials</span>
                        <span className="block text-slate-500 italic">Verified Competencies</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl font-light">
                        Credentials matter because they reinforce how you think and operate. My certifications reflect the commitment I have to continuous education, multidisciplinary knowledge and technical excellence, spanning programming, networking, infrastructure, digital security, artificial intelligence, and systems integration—supporting the design of scalable, resilient, and automation-ready environments.
                    </p>
                </div>

                {/* Right: Active Details */}
                <div className="flex-1 flex flex-col items-end text-right justify-start space-y-6 lg:pl-10 relative">
                    {/* Navigation - Absolute or part of this block */}
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
                            aria-label="Previous credential"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
                            aria-label="Next credential"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4 max-w-lg transition-all duration-300">
                        <h2 className="text-3xl font-bold text-white">{activeCert.title}</h2>
                        <h3 className="text-xl text-blue-400">{activeCert.issuer} — {activeCert.date}</h3>
                        <p className="text-slate-400 leading-relaxed">
                            {activeCert.description}
                        </p>
                        <a
                            href={activeCert.link}
                            className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:text-blue-400 hover:border-blue-400 transition-colors mt-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            View Certificate
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom: 3D Slider */}
            <div
                className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center perspective-1000 overflow-hidden outline-none cursor-grab active:cursor-grabbing"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                <div className="relative w-full h-full max-w-4xl flex items-center justify-center" style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
                    {certificates.map((cert, index) => {
                        const style = getCardStyle(index);
                        return (
                            <div
                                key={cert.id}
                                className={`absolute w-[300px] h-[220px] md:w-[500px] md:h-[350px] flex flex-col justify-between select-none cursor-pointer duration-500
                                    ${cert.image ? '' : 'bg-white text-slate-900 shadow-2xl rounded-sm p-8 border-l-8 border-l-blue-600'}
                                `}
                                style={style as React.CSSProperties}
                                onClick={() => {
                                    if (!isDragging) setActiveIndex(index);
                                }}
                            >
                                {/* Certificate Content */}
                                {cert.image ? (
                                    <div className="w-full h-full relative group">
                                        <img
                                            src={cert.image}
                                            alt={cert.title}
                                            loading="lazy"
                                            className="w-full h-full object-contain drop-shadow-2xl opacity-0 transition-opacity duration-700 ease-out"
                                            onLoad={(e) => {
                                                e.currentTarget.classList.remove('opacity-0');
                                            }}
                                        />
                                    </div>
                                ) : (
                                    /* Placeholder Design */
                                    <div className="border-4 border-double border-slate-200 h-full p-6 relative">
                                        <div className="absolute top-4 right-4 opacity-10">
                                            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                                        </div>

                                        <div className="text-center space-y-4 mt-4">
                                            <div className="uppercase tracking-widest text-xs font-serif text-slate-500">Certificate of Completion</div>
                                            <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{cert.title}</h3>
                                            <div className="w-16 h-[2px] bg-slate-300 mx-auto my-4"></div>
                                            <p className="text-sm text-slate-500">Presented to the holder for successful completion of the requirements.</p>

                                            <div className="flex justify-between items-end mt-8 pt-8 px-4">
                                                <div className="text-left">
                                                    <div className="w-24 h-[1px] bg-slate-400 mb-2"></div>
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Date: {cert.date}</div>
                                                </div>
                                                <div className="text-right">
                                                    <img src="/portfolio/favicon.svg" className="w-8 h-8 opacity-20 mb-2 ml-auto" alt="Logo" />
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">{cert.issuer}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
