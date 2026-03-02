export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>

        {/* Animated Gradient Ring */}
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  );
}
