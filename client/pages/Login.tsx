
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/index");
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-md">
        {user ? (
          <div className="flex flex-col items-center">
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name}
              className="w-24 h-24 rounded-full mb-4"
            />
            <h1 className="text-2xl font-semibold mb-2">
              {user.user_metadata.full_name}
            </h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <Button onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Welcome</h1>
            <p className="text-gray-600 mb-8">
              Sign in to access your account
            </p>
            <Button onClick={signInWithGoogle} className="w-full">
              Sign in with Google
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
