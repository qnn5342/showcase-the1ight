export default function ResultsLoading() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#15333B", color: "#F0F0F0" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero skeleton */}
        <div className="text-center space-y-3">
          <div
            className="h-4 w-32 rounded mx-auto animate-pulse"
            style={{ backgroundColor: "#214C54" }}
          />
          <div
            className="h-12 w-80 rounded-lg mx-auto animate-pulse"
            style={{ backgroundColor: "#214C54" }}
          />
          <div
            className="h-4 w-64 rounded mx-auto animate-pulse"
            style={{ backgroundColor: "#214C54" }}
          />
        </div>

        {/* Winner columns skeleton */}
        <div>
          <div
            className="h-7 w-48 rounded mb-6 animate-pulse"
            style={{ backgroundColor: "#214C54" }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div
                  className="h-12 rounded-lg animate-pulse"
                  style={{ backgroundColor: "#214C54" }}
                />
                <div
                  className="aspect-video rounded-xl animate-pulse"
                  style={{ backgroundColor: "#214C54" }}
                />
                <div
                  className="h-16 rounded-lg animate-pulse"
                  style={{ backgroundColor: "#214C54" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Participants grid skeleton */}
        <div>
          <div
            className="h-7 w-48 rounded mb-6 animate-pulse"
            style={{ backgroundColor: "#214C54" }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse"
                style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
              >
                <div className="aspect-video" style={{ backgroundColor: "#1a3e47" }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "#1a3e47" }} />
                  <div className="h-3 w-1/2 rounded" style={{ backgroundColor: "#1a3e47" }} />
                  <div className="h-8 w-36 rounded" style={{ backgroundColor: "#1a3e47" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
