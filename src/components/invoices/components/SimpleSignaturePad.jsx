import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const SimpleSignaturePad = forwardRef(({ width = 160, height = 33 }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useImperativeHandle(ref, () => ({
    getImage: () => canvasRef.current.toDataURL('image/png'),
    clear: () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue'; // Set pen color here

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches[0]) {
        x = e.touches.clientX - rect.left;
        y = e.touches.clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      return { x, y };
    };

    const startDraw = (e) => {
      setIsDrawing(true);
      ctx.beginPath();
      const { x, y } = getPos(e);
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const endDraw = () => {
      setIsDrawing(false);
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    window.addEventListener('touchend', endDraw);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', endDraw);

      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      window.removeEventListener('touchend', endDraw);
    };
  }, [isDrawing, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        verticalAlign: 'bottom',
        background: 'transparent',
        marginBottom: 0,
        display: 'inline-block',
        cursor: 'crosshair'
      }}
    />
  );
});

export default SimpleSignaturePad;
