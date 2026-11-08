"use strict";

window.qBittorrent ??= {};
window.qBittorrent.PeerDiscoveryOptions ??= (() => {
    const fields = [
        ["disableDHT", "DisableDHT", "disable_dht"],
        ["disablePEX", "DisablePEX", "disable_pex"],
        ["disableLSD", "DisableLSD", "disable_lsd"]
    ];

    const changedFlags = (hash, original, selected, privateTorrent) => {
        const flags = { hashes: hash };
        if (privateTorrent)
            return flags;

        for (const [field] of fields) {
            if (selected[field] !== original[field])
                flags[field] = String(selected[field]);
        }
        return flags;
    };

    const init = () => {
        const windowEl = document.getElementById("peerDiscoveryOptionsPage");
        const { hash } = window.MUI.Windows.instances["peerDiscoveryOptionsPage"].options.data;
        const get = (name) => document.getElementById(`peerDiscovery${name}`);
        const saveButton = get("Save");
        let original;
        let privateTorrent = false;

        get("Cancel").addEventListener("click", (e) => {
            window.qBittorrent.Client.closeWindow(windowEl);
        });

        saveButton.addEventListener("click", async (e) => {
            if (original === undefined)
                return;

            const selected = Object.fromEntries(fields.map(([field, name]) => [field, get(name).checked]));
            const changes = changedFlags(hash, original, selected, privateTorrent);
            if (Object.keys(changes).length === 1) {
                window.qBittorrent.Client.closeWindow(windowEl);
                return;
            }

            saveButton.disabled = true;
            try {
                const response = await fetch("api/v2/torrents/setPeerDiscoveryOptions", {
                    method: "POST",
                    body: new URLSearchParams(changes)
                });
                if (!response.ok)
                    throw new Error(await response.text() || "QBT_TR(Unable to save peer discovery options)QBT_TR[CONTEXT=TorrentOptionsDialog]");

                window.qBittorrent.Client.closeWindow(windowEl);
                updatePropertiesPanel();
            }
            catch (error) {
                alert(error.message);
                saveButton.disabled = false;
            }
        });

        const url = new URL("api/v2/torrents/properties", window.location);
        url.search = new URLSearchParams({ hash: hash });

        fetch(url, { cache: "no-store" }).then(async (response) => {
            if (!response.ok)
                throw new Error(await response.text() || "QBT_TR(Unable to load peer discovery options)QBT_TR[CONTEXT=TorrentOptionsDialog]");

            const properties = await response.json();
            privateTorrent = properties.private === true;
            original = Object.fromEntries(fields.map(([field, , key]) => [field, properties[key]]));

            for (const [field, name] of fields) {
                get(name).checked = privateTorrent || original[field];
                get(name).disabled = privateTorrent;
                if (privateTorrent)
                    get(name).title = "QBT_TR(Not applicable to private torrents)QBT_TR[CONTEXT=TorrentOptionsDialog]";
            }
            saveButton.disabled = false;
        }).catch((error) => {
            alert(error.message);
            window.qBittorrent.Client.closeWindow(windowEl);
        });
    };

    return { init, changedFlags };
})();
Object.freeze(window.qBittorrent.PeerDiscoveryOptions);
