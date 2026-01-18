import { useAuth } from "../Context/AuthContext";

export default function ChatItem({
  conversation,
  isActive,
  onClick,
  isTyping,
  isOnline,
}) {
  const { user } = useAuth();

  return (
    <div
      onClick={() => onClick(conversation)}
      className={`
        flex items-center gap-4 px-4 py-3 cursor-pointer
        transition-all duration-200
        ${
          isActive
            ? "bg-blue-100 border-l-4 border-blue-500"
            : "hover:bg-gray-100"
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
          className="h-14 w-14 rounded-full border border-gray-300"
        />

        {/* Online status */}
        <span
          className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full
            border-2 border-white
            ${isOnline ? "bg-green-500" : "bg-gray-400"}
          `}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Username + time */}
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-gray-800 truncate">
            {conversation.user.username}
          </h1>

          <span className="text-xs text-gray-400">
            {new Date(conversation.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Last message + badge */}
        <div className="flex justify-between items-center gap-2 mt-1">
          {isTyping ? (
            <p className="text-blue-500 text-sm animate-pulse">Typing...</p>
          ) : (
            <p className="text-sm text-gray-500 truncate">
              {conversation.lastMessage}
            </p>
          )}

          {conversation.unSeenMsgsNumber > 0 && (
            <span
              className="bg-blue-500 text-white text-xs min-w-[22px] h-[22px]
              flex items-center justify-center rounded-full font-medium"
            >
              {conversation.unSeenMsgsNumber > 9
                ? "9+"
                : conversation.unSeenMsgsNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
