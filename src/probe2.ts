import { getRouteApi } from "@tanstack/react-router";
const api = getRouteApi("/faq");
const d = api.useLoaderData();
const bad: number = d;
