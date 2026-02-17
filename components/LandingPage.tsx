import React, { useState } from 'react';
import { ArrowRight, Github, ExternalLink, Cpu, X, ShieldAlert, Cross, Heart, Box, AlertTriangle } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
}

type SectionType = 'none' | 'mission' | 'telemetry' | 'system';

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
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
                                    Hostiles: Persecución proactiva (Rango &infin;).<br/>
                                    Aliados: Respuesta reactiva (Rango 3 celdas).<br/>
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
                                        <span className="bg-space-dark p-2 border border-space-enemy/30 text-space-enemy block">HOSTIL RECIBE<br/>-25 HP</span>
                                        <span className="bg-space-dark p-2 border border-space-ally/30 text-space-ally block">ALIADO RECIBE<br/>-35 HP</span>
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
                <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest uppercase cursor-pointer">
                    <button onClick={() => setActiveSection('mission')} className={`${activeSection === 'mission' ? 'text-space-ally' : 'text-gray-400'} hover:text-white transition-colors`}>Misión</button>
                    <button onClick={() => setActiveSection('telemetry')} className={`${activeSection === 'telemetry' ? 'text-yellow-500' : 'text-gray-400'} hover:text-white transition-colors`}>Telemetría</button>
                    <button onClick={() => setActiveSection('system')} className={`${activeSection === 'system' ? 'text-cyan-500' : 'text-gray-400'} hover:text-white transition-colors`}>Sistema</button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col justify-center px-8 md:px-16 relative z-10">
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
                    <div className="max-w-4xl mx-auto md:mx-0 animate-in fade-in duration-500">
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
                    <p>ESTADO DEL SISTEMA: NORMAL</p>
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