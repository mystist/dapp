export function Pulse() {
  return (
    <div className="mx-auto w-full max-w-7xl gap-x-6 p-6 px-8 py-7">
      <div className="flex animate-pulse space-x-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 rounded bg-gray-300"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-gray-300"></div>
              <div className="col-span-1 h-2 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
