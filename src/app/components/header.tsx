import { signIn, signOut, auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  const handleSignout = async () => {
    "use server";
    await signOut();
  };

  const handleSignin = async () => {
    "use server";
    await signIn("google");
  };

  return (
    <div style={{ display: "flex", width: "100%", backgroundColor: "lightgreen", justifyContent: "end", gap: "12px" }}>
      {session?.user ? (
        <form action={handleSignout}>
          <button type="submit">Sign out</button>
        </form>
      ) : (
        <form action={handleSignin}>
          <button type="submit">Sign in</button>
        </form>
      )}
      <div>{session?.user ? session.user.email : "N/A"}</div>
    </div>
  );
}
