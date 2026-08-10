'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Ballpit = dynamic(() => import('./Ballpit'), {
  ssr: false,
  loading: () => null,
});

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

class BallpitErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.warn('[BallpitBackground] disabled due to runtime error:', error, info);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function BallpitBackground() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  if (!supported) return null;

  return (
    <BallpitErrorBoundary>
      <div
        aria-hidden
        className="fixed inset-0 z-0 overflow-hidden"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'auto' }}
        >
          <Ballpit
            count={90}
            gravity={0.5}
            friction={0.995}
            wallBounce={0.9}
            followCursor={true}
            colors={[0x7DD3FC, 0xDEDBC8, 0xFFFFFF, 0x212121]}
            ambientIntensity={0.7}
            lightIntensity={140}
            minSize={0.4}
            maxSize={0.85}
            size0={1.4}
            maxVelocity={0.12}
            maxX={5}
            maxY={5}
            maxZ={2}
          />
        </div>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/10 to-bg/60"
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </BallpitErrorBoundary>
  );
}
