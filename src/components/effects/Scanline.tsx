export function Scanline() {
  return (
    <>
      {/* Horizontal scan line */}
      <div className="scan-line" />
      
      {/* Vignette overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[99]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </>
  );
}
