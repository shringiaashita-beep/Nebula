import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch language preference
        const { data: profile } = await supabase
          .from("profiles")
          .select("language_preference")
          .eq("id", session.user.id)
          .single();

        if (profile?.language_preference) {
          import("i18next").then((i18n) => {
            i18n.default.changeLanguage(profile.language_preference);
          });
        }
      }

      setSession(session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return session ? children : <Navigate to="/" />;
}

export default ProtectedRoute;