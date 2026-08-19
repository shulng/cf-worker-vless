import { connect } from "cloudflare:sockets";

export default {
  async fetch(request) {
    const isUpgrade = request.headers.get("Upgrade") === "websocket";
    if (!isUpgrade) {
      return new Response("Not found", { status: 404 });
    }

    const url = new URL(request.url);
    const fallbackProxy = url.searchParams.get("ip") || "";
    return await upgradeWebSocket(fallbackProxy);
  },
};

async function upgradeWebSocket(fallbackProxy) {
  const [clientSocket, serverSocket] = Object.values(new WebSocketPair());

  serverSocket.accept();
  serverSocket.binaryType = "arraybuffer";
  serverSocket.send(new Uint8Array([0, 0]));

  startForwarding(serverSocket, fallbackProxy);

  return new Response(null, { status: 101, webSocket: clientSocket });
}

async function startForwarding(ws, fallbackProxy) {
  const incoming = new ReadableStream({
    start(controller) {
      ws.addEventListener("message", (event) => controller.enqueue(event.data));
      ws.addEventListener("close", () => controller.close());
      ws.addEventListener("error", () => controller.error(new Error("WebSocket error")));
    },
  });

  let tcpWriter = null;

  await incoming.pipeTo(
    new WritableStream({
      async write(chunk) {
        if (tcpWriter) {
          await tcpWriter.write(chunk);
          return;
        }

        const { socket, writer } = await resolveVlessHeader(chunk, fallbackProxy);
        tcpWriter = writer;
        streamBackToClient(socket, ws);
      },
    }),
  );
}

async function streamBackToClient(tcpSocket, ws) {
  const reader = tcpSocket.readable.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      ws.send(value);
    }
  } finally {
    reader.releaseLock();
  }
}

async function resolveVlessHeader(chunk, fallbackProxy) {
  const data = new Uint8Array(chunk);

  const addonLen = data[17];
  const portIndex = 19 + addonLen;

  const port = new DataView(chunk.slice(portIndex, portIndex + 2)).getUint16(0);

  let { hostname, cursor } = parseAddress(data, portIndex + 2);

  const initialPayload = chunk.slice(cursor);

  let socket;
  try {
    socket = connect({ hostname, port });
    await socket.opened;
  } catch {
    const [fallbackHost, fallbackPort] = fallbackProxy.split(":");
    socket = connect({ hostname: fallbackHost, port: Number(fallbackPort) || port });
    await socket.opened;
  }

  const writer = socket.writable.getWriter();

  if (initialPayload?.byteLength > 0) {
    await writer.write(initialPayload);
  }

  return { socket, writer };
}

function parseAddress(data, start) {
  const type = data[start];
  let offset = start + 1;

  switch (type) {
    case 1: {
      const length = 4;
      const hostname = data
        .slice(offset, offset + length)
        .join(".");
      return { hostname, cursor: offset + length };
    }
    case 2: {
      const length = data[offset];
      offset += 1;
      const hostname = new TextDecoder().decode(data.slice(offset, offset + length));
      return { hostname, cursor: offset + length };
    }
    case 3: {
      const length = 16;
      const view = new DataView(data.slice(offset, offset + length).buffer);
      const groups = [];
      for (let i = 0; i < 8; i++) {
        groups.push(view.getUint16(i * 2).toString(16).padStart(4, "0"));
      }
      return { hostname: groups.join(":"), cursor: offset + length };
    }
    default:
      throw new Error(`Unsupported VLESS address type: ${type}`);
  }
}
