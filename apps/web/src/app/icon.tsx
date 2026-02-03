import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="13" cy="13" r="7" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M18 18 L24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2" fill="#FCD34D" />
          <circle cx="15" cy="12" r="2" fill="#60A5FA" />
          <circle cx="12" cy="15" r="2" fill="#34D399" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
