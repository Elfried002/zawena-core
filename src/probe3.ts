import { createFileRoute } from "@tanstack/react-router";
const bad: number = createFileRoute;
const R = createFileRoute("/faq")({ loader: () => ({ a: 1 }) });
const bad2: number = R.useLoaderData();
