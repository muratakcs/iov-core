import { jsonRpcWith } from "../jsonrpc";
import { Method } from "../requests";

import { HttpClient } from "./httpclient";
import { instanceOfRpcStreamingClient } from "./rpcclient";
import { WebsocketClient } from "./websocketclient";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("RpcClient", () => {
  const tendermintUrl = "localhost:12345";

  it("has working instanceOfRpcStreamingClient()", async () => {
    pendingWithoutTendermint();

    const httpClient = new HttpClient(tendermintUrl);
    const wsClient = new WebsocketClient(tendermintUrl);

    expect(instanceOfRpcStreamingClient(httpClient)).toEqual(false);
    expect(instanceOfRpcStreamingClient(wsClient)).toEqual(true);

    httpClient.disconnect();
    await wsClient.connected();
    wsClient.disconnect();
  });

  it("should also work with trailing slashes", async () => {
    pendingWithoutTendermint();

    const statusRequest = jsonRpcWith(Method.Status);

    const httpClient = new HttpClient(tendermintUrl + "/");
    expect(await httpClient.execute(statusRequest)).toBeDefined();
    httpClient.disconnect();

    const wsClient = new WebsocketClient(tendermintUrl + "/");
    expect(await wsClient.execute(statusRequest)).toBeDefined();
    wsClient.disconnect();
  });
});