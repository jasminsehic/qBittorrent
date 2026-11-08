import { expect, test } from "vitest";

import "../../private/scripts/peerdiscoveryoptions.js";

test("Only changed peer discovery settings are submitted", () => {
    const changedFlags = window.qBittorrent.PeerDiscoveryOptions.changedFlags;
    const original = { disableDHT: true, disablePEX: false, disableLSD: false };

    expect(changedFlags("torrent", original, { ...original }, false)).toStrictEqual({ hashes: "torrent" });
    expect(changedFlags("torrent", original, { ...original, disableDHT: false }, false)).toStrictEqual({
        hashes: "torrent",
        disableDHT: "false"
    });
    expect(changedFlags("torrent", original, { ...original, disablePEX: true }, true)).toStrictEqual({ hashes: "torrent" });
});
