export function Ping() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
      <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
    </span>
  )
}
