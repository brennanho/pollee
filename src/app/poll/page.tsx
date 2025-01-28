"use client";

import React, { useEffect, useState } from "react";

export default function Poll() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const userBrenResp = await fetch("/api/user?id=brennanmho@gmail.com");
      const userBren = await userBrenResp.json();
      setUser(userBren.response.user);

    }
    fetchUser();
  }, []);

  return <div>{JSON.stringify(user)}</div>;
}
