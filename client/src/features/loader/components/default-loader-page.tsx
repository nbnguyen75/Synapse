import { Loader2Icon } from 'lucide-react';

export default function DefaultLoaderPage() {
  return (
    <div className="dlp-root">
      <style>{`
            .dlp-root {
               display: flex;
               height: 100svh;
               width: 100%;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               gap: 24px;
               padding: 0 16px;
               box-sizing: border-box;
               background-color: oklch(0.975 0.005 85);
               color: oklch(0.25 0.012 110);
            }

            .dlp-orb {
               position: relative;
               display: flex;
               height: 80px;
               width: 80px;
               align-items: center;
               justify-content: center;
               flex-shrink: 0;
            }

            .dlp-orb-glow {
               position: absolute;
               inset: 0;
               border-radius: 9999px;
               background: radial-gradient(
                  circle at 30% 30%,
                  oklch(0.58 0.07 145 / 30%),
                  oklch(0.58 0.07 145 / 10%) 60%,
                  transparent 100%
               );
               filter: blur(16px);
            }

            .dlp-orb-ring-static {
               position: absolute;
               inset: 0;
               border-radius: 9999px;
               border: 2px solid oklch(0.58 0.07 145 / 20%);
            }

            .dlp-orb-ring-spin {
               position: absolute;
               inset: 0;
               border-radius: 9999px;
               border: 2px solid transparent;
               border-top-color: oklch(0.58 0.07 145);
               animation: dlp-spin 0.8s linear infinite;
            }

            .dlp-orb-icon {
               position: relative;
               height: 24px;
               width: 24px;
               color: oklch(0.58 0.07 145);
               animation: dlp-pulse 1.6s ease-in-out infinite;
            }

            @keyframes dlp-spin {
               from { transform: rotate(0deg); }
               to { transform: rotate(360deg); }
            }

            @keyframes dlp-pulse {
               0%, 100% { opacity: 1; }
               50% { opacity: 0.4; }
            }

            .dlp-text {
               display: flex;
               flex-direction: column;
               align-items: center;
               gap: 8px;
               text-align: center;
            }

            .dlp-title {
               margin: 0;
               font-size: 16px;
               font-weight: 500;
               color: oklch(0.25 0.012 110);
            }

            .dlp-subtitle {
               margin: 0;
               font-size: 14px;
               color: oklch(0.5 0.015 100);
            }

            .dlp-skeleton-wrap {
               width: 100%;
               max-width: 384px;
               display: flex;
               flex-direction: column;
               gap: 12px;
               padding-top: 8px;
            }

            .dlp-skeleton-line {
               height: 12px;
               border-radius: 9999px;
               background-color: oklch(0.925 0.01 85);
               animation: dlp-pulse 1.6s ease-in-out infinite;
            }

            .dlp-skeleton-line--full { width: 100%; }
            .dlp-skeleton-line--lg { width: 80%; }
            .dlp-skeleton-line--md { width: 60%; }
         `}</style>

      <div className="dlp-orb">
        <div className="dlp-orb-glow" />
        <div className="dlp-orb-ring-static" />
        <div className="dlp-orb-ring-spin" />
        <Loader2Icon className="dlp-orb-icon" />
      </div>

      <div className="dlp-text">
        <p className="dlp-title">Đang tải dữ liệu</p>
        <p className="dlp-subtitle">Vui lòng chờ trong giây lát...</p>
      </div>

      <div className="dlp-skeleton-wrap">
        <div className="dlp-skeleton-line dlp-skeleton-line--full" />
        <div className="dlp-skeleton-line dlp-skeleton-line--lg" />
        <div className="dlp-skeleton-line dlp-skeleton-line--md" />
      </div>
    </div>
  );
}
