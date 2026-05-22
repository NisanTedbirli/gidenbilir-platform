'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Play, Volume2, VolumeX, Maximize2, X } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
  autoPlay?: boolean
  openFullscreenOnMount?: boolean
}

export function VideoPlayer({ src, title, className = '', autoPlay = false, openFullscreenOnMount = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(true)
  const [fullscreen, setFullscreen] = useState(openFullscreenOnMount)

  // Sync playback time when entering/exiting fullscreen
  const openFullscreen = () => {
    if (videoRef.current && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.currentTime = videoRef.current.currentTime
    }
    setFullscreen(true)
  }

  const closeFullscreen = () => {
    if (fullscreenVideoRef.current && videoRef.current) {
      videoRef.current.currentTime = fullscreenVideoRef.current.currentTime
    }
    setFullscreen(false)
  }

  // Auto-play fullscreen video when opened
  useEffect(() => {
    if (fullscreen && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.play().catch(() => {})
    }
  }, [fullscreen])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause() } else { videoRef.current.play() }
    setPlaying(!playing)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newMuted = !muted
    if (videoRef.current) videoRef.current.muted = newMuted
    if (fullscreenVideoRef.current) fullscreenVideoRef.current.muted = newMuted
    setMuted(newMuted)
  }

  const fullscreenContent = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}
      onClick={closeFullscreen}
    >
      {/* Video */}
      <div style={{ flex: 1, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <video
          ref={fullscreenVideoRef}
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          loop
          muted={muted}
          playsInline
          autoPlay
          aria-label={title ?? 'Deneyim videosu'}
        />
        {/* Close */}
        <button
          onClick={closeFullscreen}
          style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 1 }}
          aria-label="Kapat"
        >
          <X size={20} />
        </button>
        {/* Mute */}
        <button
          onClick={toggleMute}
          style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      {/* Title bar */}
      {title && (
        <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Small inline player */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-black cursor-pointer ${className}`}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          autoPlay={autoPlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={title ?? 'Deneyim videosu'}
        />

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play size={28} className="text-primary ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          onClick={(e) => { e.stopPropagation(); openFullscreen() }}
          className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
          aria-label="Tam ekran"
        >
          <Maximize2 size={16} />
        </button>

        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Fullscreen portal */}
      {fullscreen && typeof document !== 'undefined' && createPortal(fullscreenContent, document.body)}
    </>
  )
}
