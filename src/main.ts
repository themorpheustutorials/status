import { Namespace } from "./data";
import { error, json } from "itty-router-extras";
import { Obj, Router } from "itty-router";
import { readData } from "./kv";
import { namespaces as ns } from "./config.json";
import { handleScheduled } from "./cron";
import { Sentry } from "./sentry";

export const NAMESPACES: Namespace[] = ns;

const router = Router({ base: "/api" })
  .get(
    "/namespace/:id?",
    async ({ params, headers }: { params?: Obj; headers: Headers }) => {
      const id = params?.id;
      const host = headers.get("Host");

      const namespace = id
        ? NAMESPACES.find((namespace) => namespace.id === id)
        : NAMESPACES.find((namespace) => namespace.host === host);

      if (!namespace) {
        return error(404, `namespace with id ${id} or host ${host} not found`);
      }

      namespace.services = namespace.services.filter(
        (service) => service.visible
      );
      namespace.services.forEach((service) => {
        delete service.visible;
      });

      return json({
        namespace: namespace,
        services: await readData(namespace)
      });
    }
  )
  .all("*", () => error(404, "Not Found"));

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(router.handle(event.request)
    .then((response: Response) => {
      if (event.request.method === "GET") {
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Max-Age", "86400");
      }

      return response;
    })
    .catch((err: unknown) => {
      if (SENTRY_DSN) {
        const sentry = new Sentry(event, SENTRY_DSN);
        sentry.captureException(err);
      }
      return error(500, "Internal Server Error");
    }));
});

addEventListener("scheduled", (event: ScheduledEvent) => {
  event.waitUntil(
    handleScheduled().catch((err: unknown) => {
      if (SENTRY_DSN) {
        const sentry = new Sentry(event, SENTRY_DSN);
        sentry.captureException(err);
      }
    })
  );
});
