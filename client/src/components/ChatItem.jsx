import { useAuth } from "../Context/AuthContext";

export default function ChatItem({
  conversation,
  isActive,
  onClick,
  isTyping,
}) {
  const { user } = useAuth();

  return (
    <div
      onClick={() => onClick(conversation)}
      className={`flex gap-6 items-center p-5 ${
        isActive ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
    >
      <img
        src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
        alt=""
        className="h-16"
      />
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-center">
          <h1 className="font-bold">{conversation.user.username}</h1>
          <span className="text-gray-300 text-sm">
            {new Date(conversation.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          {isTyping ? (
            <p className="text-blue-400">Typing...</p>
          ) : (
            <p className="flex-1 max-w-full truncate overflow-hidden w-16">
              {conversation.lastMessage}
            </p>
          )}

          {conversation.unSeenMsgsNumber > 0 && (
            <span className="text-white bg-red-500 w-7 h-7 flex items-center justify-center rounded-full text-base">
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
