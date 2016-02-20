function GameServerInfo() {
    this.name = "Unamed Game Server";
    this.playerLimit = 100;
    this.playerCount = 0;
    this.gmtOffset = 0;
    this.ipv4 = [127, 0, 0, 1];
};

module.exports = GameServerInfo;
