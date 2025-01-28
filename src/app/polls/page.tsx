import { auth } from "@/auth";

export default async function Polls() {
  const session = await auth();

  return (
    <div>
      <div>Polls: {JSON.stringify(session)}</div>
    </div>
  );
}
