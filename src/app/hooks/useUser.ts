import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchGraphQL } from "../util";

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
      const data = await fetchGraphQL(query, { id: session.user.email }, session.accessToken);
      setUser(data.user);
    };

    fetchUser();
  }, [session?.user]);

  return { user, setUser };
}
