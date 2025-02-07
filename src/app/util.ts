export function assertDefined<T extends object>(obj: T, keys: (keyof T)[]): void {
  keys.forEach((key) => {
    if (obj[key] === undefined) {
      throw new Error(`Missing or undefined required property: ${String(key)}`);
    }
  });
}

export async function fetchGraphQL(query: string, variables = {}, accessToken = "") {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // @ts-ignore
      accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const { data } = await response.json();
  return data;
};

export function getTimeElapsed(epochTime: number) {
  const seconds = Math.abs((new Date().getTime() - new Date(epochTime).getTime()) / 1000);

  const units = [
    { label: 'y', value: 31536000 }, // 1 year = 60 * 60 * 24 * 365
    { label: 'mo', value: 2592000 }, // 1 month = 60 * 60 * 24 * 30
    { label: 'w', value: 604800 }, // 1 week = 60 * 60 * 24 * 7
    { label: 'd', value: 86400 }, // 1 day = 60 * 60 * 24
    { label: 'h', value: 3600 }, // 1 hour = 60 * 60
    { label: 'm', value: 60 }, // 1 minute = 60
    { label: 's', value: 1 } // 1 second
  ];

  for (const unit of units) {
    if (seconds >= unit.value) {
      const count = Math.floor(seconds / unit.value);
      return `${count}${unit.label}`;
    }
  }

  return '0s';
}
