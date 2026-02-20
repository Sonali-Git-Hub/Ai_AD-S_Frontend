import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';

const CustomVideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const fadeTimeoutRef = useRef(null);

    useEffect(() => {
        // Try auto-playing
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                console.log("Auto-play prevented", e);
                setIsPlaying(false);
            });
        }
    }, [src]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) { /* Safari */
                containerRef.current.webkitRequestFullscreen();
            } else if (containerRef.current.msRequestFullscreen) { /* IE11 */
                containerRef.current.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 2500);
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden bg-black/95 rounded-2xl border border-white/5 shadow-2xl group flex flex-col justify-center ${isFullscreen ? 'h-full rounded-none border-none' : 'aspect-video'}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseMove}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover sm:object-contain cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controlsList="nodownload"
                playsInline
            />

            {/* Floating Controls Bar */}
            <div
                className={`absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 transition-all duration-300 transform ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
            >
                <div className="bg-[#2A2B32]/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 sm:gap-4 md:gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                    {/* Live Badge */}
                    <div className="flex items-center gap-2 bg-[#8C52FF] px-3 py-1.5 rounded text-white font-bold text-xs tracking-wide shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        LIVE
                    </div>

                    {/* Play / Pause */}
                    <button
                        onClick={togglePlay}
                        className="text-white hover:text-[#8C52FF] transition-colors shrink-0"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current border-2 border-transparent" />}
                    </button>

                    {/* Progress Bar Container */}
                    <div className="flex-1 flex items-center group/progress relative h-6 cursor-pointer">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-white group-hover/progress:bg-[#8C52FF] transition-colors rounded-full"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white/80 text-xs sm:text-sm font-medium tracking-wide shrink-0 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Volume control */}
                    <button
                        onClick={toggleMute}
                        className="text-white/80 hover:text-white transition-colors shrink-0 hidden sm:block"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    {/* Settings / Sliders */}
                    <button className="text-white/80 hover:text-white transition-colors shrink-0 hidden md:block">
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="text-white/80 hover:text-white transition-colors shrink-0"
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
