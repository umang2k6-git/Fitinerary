export default function LoadingLogo() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <img
          src="/Fitinerary Logo 2.jpg"
          alt="Fitinerary"
          className="w-32 h-auto animate-pulse"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-luxury-teal/20 to-luxury-orange/20 blur-xl animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-luxury-teal animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-luxury-teal animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-luxury-teal animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
