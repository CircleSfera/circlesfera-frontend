export default function SelectChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="w-24 h-24 border-2 border-gray-700 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
      <p>Send private photos and messages to a friend or group.</p>
    </div>
  );
}
