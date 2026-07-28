export default function AppLoaderPage() {
  return (
    <>
      <style>{`
        @keyframes shimmer-move {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-element {
          background: linear-gradient(
            90deg,
            var(--sb) 25%,
            var(--sh) 37%,
            var(--sb) 63%
          );
          background-size: 200% 100%;
          animation: shimmer-move 1.4s infinite linear;
        }
        :root {
          --sb: #e4e4e7;
          --sh: #f4f4f5;
        }
        .dark {
          --sb: #18181b;
          --sh: #27272a;
        }
      `}</style>

      <div className="w-full h-full flex overflow-hidden animate-in fade-in duration-500 select-none">
        {/* Left Sidebar Skeleton (Visible on md+) */}
        <div className="w-60 h-full border-r border-border/40 bg-card/10 hidden md:flex flex-col p-4 space-y-6 shrink-0">
          {/* Top Workspace Badge */}
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <div className="shimmer-element h-6.5 w-6.5 rounded-lg shrink-0" />
            <div className="shimmer-element h-4.5 w-24 rounded" />
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="shimmer-element h-8.5 w-8.5 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer-element h-3.5 w-20 rounded" />
              <div className="shimmer-element h-2.5 w-28 rounded" />
            </div>
          </div>

          {/* Navigation Lists */}
          <div className="flex-1 space-y-3.5 pt-2">
            <div className="shimmer-element h-8 w-full rounded-lg" />
            <div className="shimmer-element h-8 w-full rounded-lg" />
            <div className="shimmer-element h-8 w-full rounded-lg" />
            <div className="shimmer-element h-8 w-full rounded-lg" />
            <div className="shimmer-element h-8 w-full rounded-lg" />
            <div className="shimmer-element h-8 w-full rounded-lg" />
          </div>

          {/* Footer bottom toggle tools */}
          <div className="pt-4 border-t border-border/40 flex items-center justify-between">
            <div className="shimmer-element h-8 w-20 rounded-md" />
            <div className="shimmer-element h-8 w-16 rounded-md" />
          </div>
        </div>

        {/* Central Workspace Panel */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-background">
          {/* Top Navigation Header Bar */}
          <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 sm:px-6 shrink-0">
            {/* Left sidebar toggle placeholders */}
            <div className="flex items-center gap-3">
              <div className="shimmer-element h-8 w-8 rounded-md md:hidden" />
              <div className="shimmer-element h-8 w-8 rounded-md hidden md:block" />
              <div className="shimmer-element h-4.5 w-28 rounded" />
            </div>

            {/* Middle search input shape */}
            <div className="hidden sm:block flex-1 max-w-md mx-6">
              <div className="shimmer-element h-8.5 w-full rounded-lg" />
            </div>

            {/* Right Action Widgets */}
            <div className="flex items-center gap-2">
              <div className="shimmer-element h-8.5 w-20 rounded-lg hidden sm:block" />
              <div className="shimmer-element h-8.5 w-8.5 rounded-lg" />
              <div className="shimmer-element h-8.5 w-8.5 rounded-lg" />
            </div>
          </div>

          {/* Main Content Area Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col space-y-5">
            {/* Subheader bar */}
            <div className="flex items-center justify-between pb-1.5">
              <div className="space-y-1">
                <div className="shimmer-element h-5 w-32 rounded" />
                <div className="shimmer-element h-3 w-48 rounded" />
              </div>
              <div className="shimmer-element h-8.5 w-36 rounded-lg" />
            </div>

            {/* Note Cards Bento Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
              {/* Note Card Skeleton 1 */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-40 rounded" />
                    <div className="shimmer-element h-4 w-4 rounded" />
                  </div>
                  {/* Tags */}
                  <div className="flex gap-1.5">
                    <div className="shimmer-element h-4.5 w-12 rounded-full" />
                    <div className="shimmer-element h-4.5 w-14 rounded-full" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-11/12 rounded" />
                    <div className="shimmer-element h-3 w-4/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>

              {/* Note Card Skeleton 2 */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-32 rounded" />
                  </div>
                  {/* Tags */}
                  <div className="flex gap-1.5">
                    <div className="shimmer-element h-4.5 w-16 rounded-full" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-5/6 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>

              {/* Note Card Skeleton 3 (Visible on lg+) */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 hidden lg:flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-44 rounded" />
                    <div className="shimmer-element h-4 w-4 rounded" />
                  </div>
                  {/* Tags */}
                  <div className="flex gap-1.5">
                    <div className="shimmer-element h-4.5 w-14 rounded-full" />
                    <div className="shimmer-element h-4.5 w-10 rounded-full" />
                    <div className="shimmer-element h-4.5 w-16 rounded-full" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-3/4 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>

              {/* Note Card Skeleton 4 */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-36 rounded" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-2/3 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>

              {/* Note Card Skeleton 5 */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-28 rounded" />
                    <div className="shimmer-element h-4 w-4 rounded" />
                  </div>
                  {/* Tags */}
                  <div className="flex gap-1.5">
                    <div className="shimmer-element h-4.5 w-12 rounded-full" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-full rounded" />
                    <div className="shimmer-element h-3 w-5/6 rounded" />
                    <div className="shimmer-element h-3 w-4/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>

              {/* Note Card Skeleton 6 (Visible on lg+) */}
              <div className="border border-border/40 bg-card/30 rounded-xl p-4 hidden lg:flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="shimmer-element h-4 w-48 rounded" />
                  </div>
                  {/* Content Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="shimmer-element h-3 w-11/12 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="shimmer-element h-3.5 w-24 rounded" />
                  <div className="shimmer-element h-4 w-4 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Panel Sidebar Mimic (Visible on lg+) */}
        <div className="w-75 h-full border-l border-border/40 bg-card/5 hidden xl:flex flex-col p-4 space-y-4 shrink-0">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <div className="shimmer-element h-5.5 w-5.5 rounded-full" />
            <div className="shimmer-element h-4 w-32 rounded" />
          </div>

          {/* Simulated Chat Bubbles */}
          <div className="flex-1 space-y-4 pt-2 overflow-hidden">
            {/* Bot bubble */}
            <div className="space-y-1.5">
              <div className="shimmer-element h-3 w-16 rounded" />
              <div className="shimmer-element h-14 w-full rounded-xl" />
            </div>
            {/* User bubble */}
            <div className="space-y-1.5 flex flex-col items-end">
              <div className="shimmer-element h-3 w-12 rounded align-right" />
              <div className="shimmer-element h-10 w-4/5 rounded-xl" />
            </div>
            {/* Bot bubble */}
            <div className="space-y-1.5">
              <div className="shimmer-element h-3 w-16 rounded" />
              <div className="shimmer-element h-20 w-full rounded-xl" />
            </div>
          </div>

          {/* Input bar bottom mimic */}
          <div className="pt-2">
            <div className="shimmer-element h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
