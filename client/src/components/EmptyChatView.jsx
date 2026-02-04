export default function EmptyChatView() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <img
            src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
            className="h-24 w-24 opacity-70"
          />
          <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Chat
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-700">
          Start a conversation
        </h2>

        <p className="text-sm text-gray-500 max-w-xs">
          Select a user from the left panel to view messages or send a new one
        </p>
      </div>
    </div>
  );
}
