import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchGraphQL } from "../util";
import { User } from "../types";

export function useUser() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;
      const query = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            image
            gender
            generation
          }
        }
      `;
      // @ts-expect-error TEMPORARY FIX
      const data = await fetchGraphQL(query, { id: session.user.email }, session?.accessToken);
      setUser(data.user);
    };

    fetchUser();
    // @ts-expect-error TEMPORARY FIX
  }, [session?.user, session?.accessToken]);

  return { user, setUser };
}
