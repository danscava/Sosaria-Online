"use strict";

/** Information describing a single game server.
 * 
 * @constructor
 */
function GameServerInfo() {
    /// The display name of the game server
    this.name = "Unamed Game Server";
    /// The limit of concurrently connected players
    this.playerLimit = 100;
    /// The count of currently connected players
    this.playerCount = 0;
    /// The GMT offset of the server (only positive values)
    this.gmtOffset = 0;
    /// The IPv4 address the server is bound to
    this.ipv4 = [127, 0, 0, 1];
};

module.exports = GameServerInfo;
