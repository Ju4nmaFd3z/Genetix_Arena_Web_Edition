import React, { useEffect, useState } from 'react';

interface SignalLossEffectProps {
    phase: 'idle' | 'noise' | 'dark';
}

const SignalLossEffect: React.FC<SignalLossEffectProps> = ({ phase }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (phase !== 'idle') {
            setIsVisible(true);
        } else {
            // Delay unmounting/hiding to allow fade out
            const timer = setTimeout(() => setIsVisible(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    return (
        <>
            {/* SVG Filters Definitions */}
            <svg className="absolute w-0 h-0 pointer-events-none" style={{ position: 'absolute', top: -9999, left: -9999 }}>
                <defs>
                    <filter id="signal-glitch">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.85"
                            numOctaves="3"
                            result="warp"
                        >
                            <animate
                                attributeName="baseFrequency"
                                values="0.85;0.9;0.8"
                                dur="0.05s"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            xChannelSelector="R"
                            yChannelSelector="G"
                            scale="30"
                            in="SourceGraphic"
                            in2="warp"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Container with Opacity Transition for Smooth Exit */}
            <div
                className={`absolute inset-0 z-[100] pointer-events-none overflow-hidden transition-opacity duration-1000 ease-out ${phase !== 'idle' ? 'opacity-100' : 'opacity-0'}`}
                style={{ display: isVisible ? 'block' : 'none' }}
            >

                {/* PHASE 1: NOISE (Digital Artifacts) */}
                <div className={`absolute inset-0 transition-opacity duration-100 ${phase === 'noise' ? 'opacity-100' : 'opacity-0'}`}>
                    {/* 1. Heavy Digital Noise (Color Dodge for brightness) */}
                    <div className="absolute inset-0 opacity-80 mix-blend-hard-light animate-static-noise">
                        <div className="w-full h-full bg-repeat bg-[length:64px_64px]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                                filter: 'contrast(200%) brightness(150%)'
                            }}
                        ></div>
                    </div>

                    {/* 2. Horizontal Banding (Scanlines) */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),rgba(255,255,255,0.1)_50%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.5))] bg-[length:100%_4px] animate-scan-fast mix-blend-overlay"></div>

                    {/* 3. Glitch Blocks (Digital Corruption) */}
                    <div className="absolute inset-0 animate-glitch-blocks opacity-90 mix-blend-difference">
                        <div className="absolute top-1/4 left-0 w-full h-4 bg-white transform skew-x-12"></div>
                        <div className="absolute top-2/3 left-0 w-full h-12 bg-white transform -skew-x-12"></div>
                        <div className="absolute top-1/2 left-1/4 w-1/2 h-2 bg-white"></div>
                    </div>

                    {/* 4. RGB Shift (Chromatic Aberration) */}
                    <div className="absolute inset-0 mix-blend-screen opacity-80 animate-rgb-shift bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-[length:200%_100%]"></div>
                </div>


                {/* PHASE 2: DARK (Sensor Failure) */}
                <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${phase === 'dark' ? 'opacity-90' : 'opacity-0'}`}>
                    {/* Subtle static in the dark */}
                    <div className="absolute inset-0 opacity-20 animate-static-noise mix-blend-screen">
                        <div className="w-full h-full bg-repeat bg-[length:128px_128px]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                                filter: 'grayscale(100%) contrast(150%)'
                            }}
                        ></div>
                    </div>

                    {/* Faint Scanlines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[length:100%_8px] animate-scan-fast"></div>
                </div>

            </div>
        </>
    );
};

export default SignalLossEffect;
