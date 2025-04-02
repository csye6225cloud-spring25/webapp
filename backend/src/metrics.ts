import StatsD from "node-statsd";

export const statsd = new (StatsD as any)({ host: "localhost", port: 8125 });
