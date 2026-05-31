export default function Modal({ title, onClose, children }) {
  return (
    /* Full-screen backdrop */
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      {/*
        Mobile  : sheet slides up from bottom (rounded top corners only)
        Desktop : centered card with rounded corners all around
      */}
      <div className="flex w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">

        {/* Drag handle – decorative, mobile only */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-300 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body – capped so it never overflows small screens */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 sm:max-h-[80vh]">
          {children}
        </div>

      </div>
    </div>
  );
}
