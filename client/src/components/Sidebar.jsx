import { useSwipeable } from "react-swipeable";
import { X } from "lucide-react";
import SearchUsersInput from "./SearchUsersInput";
import ChatList from "./ChatList";
import UserProfile from "./UserProfile";
import { useUIStore } from "@/store/uiStore";

export default function Sidebar({
  user,
  results,
  searchInput,
  setSearchInput,
  //   setIsSidebarOpen,
  //   getUserMessages,
  // isSidebarOpen,
  openConversation,
  isLoadingSearching,
}) {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useUIStore((s) => s.setIsSidebarOpen);

  const sideBarHandlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    trackTouch: true,
    delta: 25, // المسافة المطلوبة للسحب
    preventDefaultTouchmoveEvent: true, // يمنع scroll أثناء السحب
  });
  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Invisible swipe area for opening */}
      {!isSidebarOpen && (
        <div
          {...sideBarHandlers}
          className="fixed top-0 left-0 z-40 h-screen w-24"
        />
      )}
      {/* Sidebar */}
      <div
        {...sideBarHandlers}
        className={`
    fixed md:static z-51
    flex flex-col p-4 gap-5
    h-screen
    bg-gray-100
    transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    sm:w-72 md:w-96
  `}
      >
        {/* ❌ Close Button (Mobile only) */}
        <button
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="
    md:hidden
    self-end
    p-2
    rounded-full
    text-gray-600
    hover:bg-gray-200
    hover:text-gray-900
    focus:outline-none
    focus:ring-2
    focus:ring-gray-300
    transition
    duration-200
    active:scale-95
  "
        >
          <X size={20} />
        </button>

        {/* Profile */}
        <UserProfile user={user} />

        {/* Search + Chat List */}
        <div className="flex flex-col bg-white py-5 rounded-2xl gap-6 flex-1 min-h-0">
          {/* Search */}
          <SearchUsersInput
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />

          {/* Chat List */}

          <ChatList
            // recentChats={recentChats}
            // activeChatUser={activeChatUser}
            results={results}
            searchInput={searchInput}
            // getUserMessages={getUserMessages}
            openConversation={openConversation}
            isLoadingSearching={isLoadingSearching}
            // isLoadingRecentChats={isLoadingRecentChats}
            // typingUsers={typingUsers}
            // onlineUsersMap={onlineUsers}
          />
        </div>
      </div>
    </>
  );
}
