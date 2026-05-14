import { useEffect } from 'react';

interface BsodProps {
  onDismiss: () => void;
}

const BSOD_DURATION_MS = 2000;

export default function Bsod({ onDismiss }: BsodProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, BSOD_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0000AA',
        color: '#FFFFFF',
        fontFamily: '"MS Sans Serif", sans-serif',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '24px' }}>
          Windows
        </p>
        <p style={{ marginBottom: '24px' }}>
          A fatal exception 0E has occurred at 0028:C00E3AB7 in VXD VMM(01) +<br />
          00010E36. The current application will be terminated.
        </p>
        <p style={{ marginBottom: '8px' }}>
          *&nbsp; Press any key to terminate the current application.
        </p>
        <p style={{ marginBottom: '24px' }}>
          *&nbsp; Press CTRL+ALT+DEL to restart your computer. You will lose any
          unsaved information in all applications.
        </p>
        <p>
          Press any key to continue <span style={{ animation: 'bsod-blink 1s step-end infinite' }}>_</span>
        </p>
      </div>
      <style>{`
        @keyframes bsod-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
