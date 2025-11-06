import { ImageResponse } from 'next/og';

export const alt = 'Luminaire Solar - Leading Provider of Solar Solutions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FA9F47 0%, #FFD3A0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Background overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
          }}
        />

        {/* Sun Icon */}
        <div
          style={{
            display: 'flex',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'white',
            marginBottom: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FA9F47 0%, #FFD3A0 100%)',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          Luminaire Solar
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '36px',
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            maxWidth: '900px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          Leading Provider of Solar Solutions
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Comprehensive Solar Energy Solutions
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
