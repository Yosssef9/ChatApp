export default function UserProfile({ user }) {
  return (
    <div className="flex items-center gap-3 bg-blue-700 p-3 rounded-xl shadow-md">
      <div className="relative">
        <img
          src="https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"
          className="h-14 w-14 rounded-full border-2 border-white"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      </div>
      <h1 className="text-white font-semibold">{user.username}</h1>
    </div>
  );
}
