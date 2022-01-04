import { Namespace } from "./data";
import { handleScheduled } from "./cron";
import { initSentry } from "./sentry";
import { error, json } from "itty-router-extras";
import { Obj, Router } from "itty-router";
import { readData } from "./kv";

export const NAMESPACES: Namespace[] = [
  {
    id: "cryptic",
    host: "status.cryptic-game.net",
    name: "Cryptic",
    services: [
      {
        // TODO: add websocket support
        id: "ws",
        name: "WebSocket",
        description: "",
        visible: true,
        url: "https://ws.cryptic-game.net",
        method: "GET",
        status: 400,
      },
      {
        id: "rest-api",
        name: "Rest Api",
        description: "",
        visible: true,
        url: "https://server.cryptic-game.net/status",
        method: "GET",
        status: 200,
      },
      {
        id: "frontend",
        name: "Frontend",
        description: "",
        visible: true,
        url: "https://play.cryptic-game.net",
        method: "HEAD",
        status: 200,
      },
      {
        id: "website",
        name: "Website",
        description: "",
        visible: true,
        url: "https://www.cryptic-game.net",
        method: "HEAD",
        status: 200,
      },
      {
        id: "wiki",
        name: "Wiki",
        description: "",
        visible: true,
        url: "https://wiki.cryptic-game.net",
        method: "HEAD",
        status: 200,
      },
      {
        id: "docs",
        name: "Documentation",
        description: "",
        visible: true,
        url: "https://docs.cryptic-game.net",
        method: "HEAD",
        status: 200,
      },
      {
        id: "weblate",
        name: "Weblate",
        description: "",
        visible: true,
        url: "https://weblate.cryptic-game.net",
        method: "HEAD",
        status: 200,
      },
    ],
  },
  {
    id: "morpheus",
    host: "status.the-morpheus.de",
    name: "Morpheus",
    services: [
      {
        id: "website",
        name: "Website",
        description: "",
        visible: true,
        url: "https://the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "id",
        name: "MorphID",
        description: "",
        visible: true,
        url: "https://id.the-morpheus.de",
        method: "HEAD",
        status: 301,
      },
      {
        id: "certificates",
        name: "Certificates",
        description: "",
        visible: true,
        url: "https://certificates.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "cc",
        name: "Coding Challenges",
        description: "",
        visible: false,
        url: "https://cc.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "element",
        name: "Element",
        description: "",
        visible: true,
        url: "https://element.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "matrix",
        name: "Matrix",
        description: "",
        visible: true,
        url: "https://synapse.the-morpheus.de/_matrix/static/",
        method: "HEAD",
        status: 200,
      },
      {
        id: "md",
        name: "HedgeDoc",
        description: "",
        visible: true,
        url: "https://md.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "academy",
        name: "The Morpheus Academy",
        description: "",
        visible: true,
        url: "https://the-morpheus.academy",
        method: "GET",
        status: 200,
      },
      {
        id: "resources",
        name: "Resources",
        description: "",
        visible: true,
        url: "https://resources.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      // {
      //   id: "bin",
      //   name: "PrivateBin",
      //   description: "",
      //   visible: true,
      //   url: "https://bin.the-morpheus.de",
      //   method: "HEAD",
      //   status: 200,
      // },
      {
        id: "jitsi",
        name: "Jitsi",
        description: "",
        visible: true,
        url: "https://jitsi.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "public",
        name: "Public",
        description: "",
        visible: true,
        url: "https://public.the-morpheus.de",
        method: "HEAD",
        status: 200,
      },
      {
        id: "grafana",
        name: "Grafana",
        description: "",
        visible: false,
        url: "https://grafana.the-morpheus.org/login",
        method: "HEAD",
        status: 200,
      },
      {
        id: "challenges",
        name: "Challenges",
        description: "",
        visible: true,
        url: "https://the-morpheus.cc",
        method: "HEAD",
        status: 200,
      },
      {
        id: "challenges_api",
        name: "Challenges API",
        description: "",
        visible: true,
        url: "https://api.the-morpheus.cc/status",
        method: "HEAD",
        status: 200,
      },
    ],
  },
  {
    id: "sec_shell",
    host: "status.secshell.net",
    name: "Secure Shell Networks",
    services: [
      {
        id: "docs",
        name: "Documentation",
        description: "",
        visible: true,
        url: "https://docs.secshell.net/de/",
        method: "HEAD",
        status: 200,
      },
      {
        id: "guacamole",
        name: "Apache Guacamole",
        description: "",
        visible: true,
        url: "https://guacamole.secshell.net/",
        method: "HEAD",
        status: 200,
      },
      {
        id: "overleaf",
        name: "Overleaf",
        description: "",
        visible: true,
        url: "https://overleaf.secshell.net/login",
        method: "HEAD",
        status: 200,
      },
    ],
  },
];

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
        services: await readData(namespace),
      });
    }
  )
  .all("*", () => error(404, "Not Found"));

addEventListener("fetch", (event) => {
  const response = router.handle(event.request).catch((err: unknown) => {
    initSentry(event).captureException(err);
    return error(500);
  });

  event.respondWith(response);
});

addEventListener("scheduled", (event) => {
  event.waitUntil(
    handleScheduled().catch((err: unknown) => {
      initSentry(event).captureException(err);
    })
  );
});
