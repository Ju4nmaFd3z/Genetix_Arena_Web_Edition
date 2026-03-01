import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Github, ExternalLink, Cpu, X, ShieldAlert, Cross, Heart, Box, AlertTriangle, Volume2, VolumeX } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

type SectionType = 'none' | 'mission' | 'telemetry' | 'system';

const ChaseAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [entities, setEntities] = useState<{
        id: number;
        type: 'ally' | 'enemy';
        x: number;
        y: number;
        vx: number;
        vy: number;
        opacity: number;
        scale: number;
        hp: number;
    }[]>([]);

    // Ref to track entities in the animation loop (avoids stale closures)
    const entitiesRef = useRef(entities);
    useEffect(() => {
        entitiesRef.current = entities;
    }, [entities]);

    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const nextSpawnRef = useRef<number>(0);
    const idCounter = useRef<number>(0);

    // Handle resize to keep coordinate system valid
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const spawnSquad = (width: number, height: number) => {
        if (width === 0 || height === 0) return;

        const edge = Math.floor(Math.random() * 3); // 0: Top, 1: Right, 2: Bottom

        let startX, startY, endX, endY;
        const padding = 50;

        switch (edge) {
            case 0: // Top -> Bottom/Left
                startX = width * Math.random(); // Use full width
                startY = -padding;
                endX = width * (Math.random() * 0.5); // Move towards left-ish
                endY = height + padding;
                break;
            case 1: // Right -> Left
                startX = width + padding;
                startY = height * Math.random();
                endX = -padding;
                endY = height * Math.random();
                break;
            case 2: // Bottom -> Top/Left
                startX = width * Math.random(); // Use full width
                startY = height + padding;
                endX = width * (Math.random() * 0.5);
                endY = -padding;
                break;
            default:
                startX = 0; startY = 0; endX = 0; endY = 0;
        }

        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 0.03 + Math.random() * 0.02;

        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        const squadId = idCounter.current++;

        // Spawn Ally
        const ally = {
            id: squadId,
            type: 'ally' as const,
            x: startX,
            y: startY,
            vx,
            vy,
            opacity: 0,
            scale: 1.1,
            hp: 100
        };

        // Spawn Enemy (chasing)
        const enemy = {
            id: squadId + 1000,
            type: 'enemy' as const,
            x: startX - (vx / speed) * 80,
            y: startY - (vy / speed) * 80,
            vx: vx * 1.05,
            vy: vy * 1.05,
            opacity: 0,
            scale: 1.1,
            hp: 100
        };

        setEntities(prev => [...prev, ally, enemy]);
    };

    const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Spawn Logic (Limit to max 2 squads / 4 entities)
        if (time > nextSpawnRef.current && dimensions.width > 0) {
            if (entitiesRef.current.length < 4) {
                spawnSquad(dimensions.width, dimensions.height);
            }
            nextSpawnRef.current = time + 4000 + Math.random() * 4000;
        }

        setEntities(prev => prev.map(e => {
            // Fade in/out
            let newOpacity = e.opacity;
            if (e.opacity < 0.8) newOpacity += 0.01;

            // Bounds check (pixels) - Increased buffer to 200px to prevent early culling of trailing enemies
            const isOutOfBounds =
                e.x < -200 || e.x > dimensions.width + 200 ||
                e.y < -200 || e.y > dimensions.height + 200;

            return {
                ...e,
                x: e.x + e.vx * deltaTime,
                y: e.y + e.vy * deltaTime,
                opacity: isOutOfBounds ? 0 : newOpacity
            };
        }).filter(e => e.opacity > 0));

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [dimensions]);

    return (
        <div
            ref={containerRef}
            className="absolute top-0 right-0 w-[40%] h-full pointer-events-none hidden md:block overflow-hidden z-0"
            style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
            }}
        >
            {entities.map(e => (
                <div
                    key={e.id}
                    className="absolute will-change-transform blur-[0.5px]"
                    style={{
                        transform: `translate3d(${e.x}px, ${e.y}px, 0) scale(${e.scale})`,
                        opacity: e.opacity,
                    }}
                >
                    {/* Entity Shape */}
                    {e.type === 'ally' ? (
                        // Ally: Circle with Core (Matches Canvas) - Smaller - SVG for perfect centering
                        <div className="relative w-4 h-4 flex items-center justify-center text-emerald-500">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                {/* Outer Ring */}
                                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="12" />
                                {/* Inner Core with Glow */}
                                <circle cx="50" cy="50" r="22" fill="currentColor" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.8))' }} />
                            </svg>
                        </div>
                    ) : (
                        // Enemy: Razor Star (Matches Canvas) - Smaller
                        <div className="relative w-5 h-5 flex items-center justify-center text-red-600">
                            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm" style={{ filter: 'drop-shadow(0 0 2px rgba(220,38,38,0.6))' }}>
                                <path
                                    d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                                    fill="#dc2626"
                                    stroke="#7f1d1d"
                                    strokeWidth="1"
                                />
                                {/* Inner Black Diamond */}
                                <path d="M12 10.5 L13.5 12 L12 13.5 L10.5 12 Z" fill="#000" />
                            </svg>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, isMuted, onToggleMute }) => {
    const [activeSection, setActiveSection] = useState<SectionType>('none');

    const renderModalContent = () => {
        switch (activeSection) {
            case 'mission':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="border-l-2 border-space-ally pl-4">
                            <h3 className="text-xl font-bold text-white mb-1">PROTOCOLOS DE IA</h3>
                            <p className="text-sm text-gray-400">Lógica de comportamiento autónomo (Paridad 1:1 con Java Original).</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-space-dark p-4 border border-space-border/50 rounded">
                                <div className="flex items-center gap-2 text-space-ally mb-2">
                                    <ShieldAlert size={18} /> <span className="font-bold text-xs tracking-widest">ALIADOS (OPS)</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong>Comportamiento Reactivo.</strong> Solo inician maniobras de evasión si detectan amenazas a &le; 3 celdas. Su prioridad es maximizar la distancia respecto al hostil más cercano. Desventaja táctica: No anticipan ataques lejanos.
                                </p>
                            </div>
                            <div className="bg-space-dark p-4 border border-space-border/50 rounded">
                                <div className="flex items-center gap-2 text-space-enemy mb-2">
                                    <Cross size={18} className="rotate-45" /> <span className="font-bold text-xs tracking-widest">ENEMIGOS (HOSTILES)</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong>Iniciativa Global.</strong> Algoritmo de persecución proactivo sin límite de rango. Calculan constantemente la ruta euclidiana más corta hacia el aliado más próximo. Ventaja táctica: Agresión perpetua y control del mapa.
                                </p>
                            </div>
                            <div className="bg-space-dark p-4 border border-space-border/50 rounded">
                                <div className="flex items-center gap-2 text-space-healer mb-2">
                                    <Heart size={18} /> <span className="font-bold text-xs tracking-widest">MED-UNITS</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong>Soporte Logístico Limitado.</strong> Escanean aliados heridos en radio 10. La curación (+50 HP) requiere adyacencia estricta (Distancia &le; 1.0). Una posición diagonal (1.41) impide la asistencia, reduciendo la cobertura efectiva.
                                </p>
                            </div>
                            <div className="bg-space-dark p-4 border border-space-border/50 rounded">
                                <div className="flex items-center gap-2 text-space-obstacle mb-2">
                                    <Box size={18} /> <span className="font-bold text-xs tracking-widest">OBSTÁCULOS</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Entidades estáticas impenetrables. Bloquean vectores de movimiento y visión directa, creando cuellos de botella tácticos que pueden ser aprovechados para frenar la persecución enemiga.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'telemetry':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 font-mono text-sm">
                        <div className="border-l-2 border-yellow-500 pl-4">
                            <h3 className="text-xl font-bold text-white mb-1 font-sans">ANÁLISIS DE EQUILIBRIO</h3>
                            <p className="text-sm text-gray-400 font-sans">Informe de Desigualdad Intencional v3.5</p>
                        </div>

                        <div className="bg-space-black p-4 border border-space-border text-xs leading-relaxed text-gray-300">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                <p>
                                    El sistema presenta una tasa de victoria hostil del ~70%. Esto <strong>NO es un error</strong>, sino una característica de diseño basada en asimetría táctica.
                                </p>
                            </div>

                            <p className="mb-4 text-yellow-500 uppercase tracking-widest border-b border-space-border pb-1">FACTORES TÉCNICOS DETERMINANTES</p>

                            <ul className="space-y-4 list-disc pl-4 marker:text-space-border">
                                <li>
                                    <strong className="text-white block mb-1">ASIMETRÍA DE INICIATIVA</strong>
                                    Hostiles: Persecución proactiva (Rango &infin;).<br />
                                    Aliados: Respuesta reactiva (Rango 3 celdas).<br />
                                    <span className="text-gray-500 italic">Resultado: Los enemigos siempre golpean primero.</span>
                                </li>
                                <li>
                                    <strong className="text-white block mb-1">GEOMETRÍA EUCLIDIANA ESTRICTA (FALLO DIAGONAL)</strong>
                                    Protocolo de curación requiere <code>distancia &le; 1.0</code>. La distancia diagonal entre celdas adyacentes es <code>&radic;2 &approx; 1.41</code>.
                                    Esto provoca que los curanderos fallen asistencias diagonales, reduciendo la cobertura teórica del 100% al ~50% en combate cerrado.
                                </li>
                                <li>
                                    <strong className="text-white block mb-1">DIFERENCIAL DE DAÑO POR COLISIÓN</strong>
                                    <span className="grid grid-cols-2 gap-2 mt-2 max-w-xs text-center font-bold">
                                        <span className="bg-space-dark p-2 border border-space-enemy/30 text-space-enemy block">HOSTIL RECIBE<br />-25 HP</span>
                                        <span className="bg-space-dark p-2 border border-space-ally/30 text-space-ally block">ALIADO RECIBE<br />-35 HP</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            case 'system':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="border-l-2 border-cyan-500 pl-4">
                            <h3 className="text-xl font-bold text-white mb-1">ESPECIFICACIONES TÉCNICAS</h3>
                            <p className="text-sm text-gray-400">Arquitectura v3.5 Stable (2026)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-space-dark p-3 rounded border border-space-border">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">STACK TECNOLÓGICO</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-black rounded text-[10px] text-cyan-400 border border-cyan-900">React 19.2.4</span>
                                        <span className="px-2 py-1 bg-black rounded text-[10px] text-cyan-400 border border-cyan-900">Vite 6.2.0</span>
                                        <span className="px-2 py-1 bg-black rounded text-[10px] text-cyan-400 border border-cyan-900">TypeScript 5.8+</span>
                                        <span className="px-2 py-1 bg-black rounded text-[10px] text-cyan-400 border border-cyan-900">Tailwind CSS 3</span>
                                    </div>
                                </div>
                                <div className="bg-space-dark p-3 rounded border border-space-border">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">MOTOR DE SIMULACIÓN</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Motor propietario <strong>GenetixEngine.ts</strong>. Ejecución desacoplada del renderizado mediante control de Tickrate (50-500ms). Renderizado Canvas 2D optimizado con double buffering implícito.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-space-black p-4 border border-space-border font-mono text-xs text-gray-400">
                                <h4 className="text-white mb-2 border-b border-gray-800 pb-1">CONSTANTES DEL SISTEMA</h4>
                                <table className="w-full text-left">
                                    <tbody>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-1">Dimensiones Grid</td>
                                            <td className="text-right text-white">75 x 25</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-1">Tamaño Celda</td>
                                            <td className="text-right text-white">20px</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-1">Lógica Colisión</td>
                                            <td className="text-right text-white">(dx+dy) &le; 2</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1">Base Matemática</td>
                                            <td className="text-right text-white">Euclidiana</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-space-black text-space-text flex flex-col relative overflow-hidden font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-20 pointer-events-none mask-gradient"></div>

            <nav className="relative z-10 flex justify-between items-center p-8 md:px-16 border-b border-space-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Cpu className="text-white" size={24} />
                    <span className="text-xl font-bold tracking-tighter text-white">GENETIX<span className="font-thin text-gray-400">ARENA</span></span>
                    <span className="text-[10px] bg-space-border px-1 py-0.5 rounded text-gray-400 ml-2">V3.5</span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest uppercase cursor-pointer">
                        <button onClick={() => setActiveSection('mission')} className={`${activeSection === 'mission' ? 'text-space-ally' : 'text-gray-400'} hover:text-white transition-colors`}>Misión</button>
                        <button onClick={() => setActiveSection('telemetry')} className={`${activeSection === 'telemetry' ? 'text-yellow-500' : 'text-gray-400'} hover:text-white transition-colors`}>Telemetría</button>
                        <button onClick={() => setActiveSection('system')} className={`${activeSection === 'system' ? 'text-cyan-500' : 'text-gray-400'} hover:text-white transition-colors`}>Sistema</button>
                    </div>

                    {/* Audio Toggle Button */}
                    <button
                        onClick={onToggleMute}
                        className={`p-2 rounded-full border border-space-border transition-all duration-300 ${isMuted ? 'text-gray-500 hover:text-white hover:border-white' : 'text-space-ally border-space-ally bg-space-ally/10'}`}
                        title={isMuted ? "Activar Sonido" : "Silenciar"}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col justify-center px-8 md:px-16 relative z-10">
                {activeSection === 'none' && <ChaseAnimation />}
                {activeSection !== 'none' ? (
                    /* Modal Overlay Content */
                    <div className="max-w-4xl w-full mx-auto md:mx-0 bg-space-panel/90 backdrop-blur-md border border-space-border p-6 md:p-10 shadow-2xl relative min-h-[400px]">
                        <button
                            onClick={() => setActiveSection('none')}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        {renderModalContent()}
                    </div>
                ) : (
                    /* Default Landing Content */
                    <div className="max-w-4xl mx-auto md:mx-0 md:max-w-[55%] animate-in fade-in duration-500">
                        <h1 className="text-5xl md:text-9xl font-bold tracking-tighter text-white mb-6 leading-none">
                            SIMULACIÓN <br />
                            DE BATALLA
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-mono mb-12 border-l-2 border-space-ally pl-6">
                            Sistema avanzado de red táctica v3.5. Simula combate autónomo con paridad lógica 1:1 respecto al motor original en Java.
                            Observa comportamientos emergentes, asimetría táctica y dinámicas de colisión en una interfaz de grado militar.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <button
                                onClick={onStart}
                                className="group bg-white text-black px-10 py-4 font-bold tracking-widest uppercase hover:bg-gray-200 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                            >
                                INICIAR SISTEMA
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex gap-4 w-full md:w-auto">
                                <a href="https://github.com/Ju4nmaFd3z/Genetix_Arena.git" target="_blank" rel="noreferrer"
                                    className="flex-1 md:flex-none p-4 border border-space-border hover:border-white transition-colors text-gray-400 hover:text-white flex justify-center">
                                    <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Github size={16} /> Java Repo
                                    </span>
                                </a>
                                <a href="https://github.com/Ju4nmaFd3z/Genetix_Arena_Web_Edition.git" target="_blank" rel="noreferrer"
                                    className="flex-1 md:flex-none p-4 border border-space-border hover:border-white transition-colors text-gray-400 hover:text-white flex justify-center">
                                    <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Github size={16} /> Web Repo
                                    </span>
                                </a>
                                <a href="https://juanma-dev-portfolio.vercel.app/" target="_blank" rel="noreferrer"
                                    className="flex-1 md:flex-none p-4 border border-space-border hover:border-space-ally transition-colors text-gray-400 hover:text-space-ally flex justify-center">
                                    <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <ExternalLink size={16} /> Portfolio
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="relative z-10 border-t border-space-border/30 p-8 md:px-16 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <p>ESTADO DEL SISTEMA: PERITA</p>
                    <p>VERSIÓN 3.5 STABLE (2026)</p>
                </div>
                <div className="text-center md:text-right">
                    <p className="uppercase tracking-widest">DEV: JUANMA FDEZ</p>
                    <p>&copy; {new Date().getFullYear()} GENETIX</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;