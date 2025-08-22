import React, { useRef, useState } from 'react';
import SimpleSignaturePad from './SimpleSignaturePad';

const SIGN_HEIGHT = 40;

export default function SignatureInput() {
  const [showPad, setShowPad] = useState(false);
  const [sigImg, setSigImg] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const sigPadRef = useRef();

  return (
    <span
      style={{
        borderBottom: '1px solid #444',
        display: 'inline-block',
        minWidth: 140,
        height: SIGN_HEIGHT,
        verticalAlign: 'bottom',
        position: 'relative',
        cursor: sigImg ? 'default' : 'pointer'
      }}
      onClick={() => {
        if (!sigImg) setShowPad(true);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showPad && (
        <>
          <SimpleSignaturePad ref={sigPadRef} width={120} height={SIGN_HEIGHT} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSigImg(sigPadRef.current.getImage());

              setShowPad(false);
              setIsHovering(false);
            }}
            style={{
              fontSize: 13,
              marginLeft: 8,
              background: 'none',
              border: '1px solid #bbb',
              borderRadius: 3,
              padding: '2px 10px',
              cursor: 'pointer',
              position: 'absolute',
              top: 2,
              left: 126
            }}
          >
            Done
          </button>
        </>
      )}
      {sigImg && !showPad && (
        <>
          <img
            src={sigImg}
            alt="Signature"
            style={{
              width: 120,
              height: SIGN_HEIGHT,
              verticalAlign: 'bottom',
              display: 'inline-block',
              background: 'transparent',
              pointerEvents: 'none'
            }}
          />
          {isHovering && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSigImg('');
                setShowPad(true);
                sigPadRef.current.clear();
              }}
              style={{
                position: 'absolute',
                top: 1,
                right: 1,
                fontSize: 12,
                background: '#fff',
                border: '1px solid #bbb',
                borderRadius: 3,
                padding: '0px 5px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              Clear
            </button>
          )}
        </>
      )}
    </span>
  );
}
