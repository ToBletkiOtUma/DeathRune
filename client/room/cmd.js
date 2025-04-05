import { Chat, Players, Ui } from 'pixel_combats/room';
try{
function CommandManager(chatService) {
    this.chatService = chatService;
    this.commands = {};
    this.permLists = {};
    this.blackLists = {};
    this.whiteListIds = {};
    this.blackListIds = {};
    this.tempPerms = {};
    this.useLimits = {};
    this.useCounts = {};

    this.chatService.OnMessage.Add(this.handleMessage.bind(this));
}

CommandManager.prototype.addCommand = function(commandName, callback, argsDescription) {
    argsDescription = argsDescription || "";
    this.commands[commandName] = { callback: callback, argsDescription: argsDescription };
};

CommandManager.prototype.addPermList = function(commandName, allowedRoomIds) {
    this.permLists[commandName] = allowedRoomIds.slice();
};

CommandManager.prototype.addBlackList = function(commandName) {
    this.blackLists[commandName] = true;
};

CommandManager.prototype.permUse = function(commandName, roomId, durationSeconds) {
    var key = commandName + ":" + roomId;
    var expiration = Date.now() + durationSeconds * 1000;
    this.tempPerms[key] = expiration;
    setTimeout(function() { delete this.tempPerms[key]; }.bind(this), durationSeconds * 1000);
};

CommandManager.prototype.limitedUse = function(commandName, maxUses) {
    this.useLimits[commandName] = maxUses;
    this.useCounts[commandName] = 0;
};

CommandManager.prototype.whiteList = function(roomId) {
    this.whiteListIds[roomId] = true;
};

CommandManager.prototype.blackList = function(roomId) {
    this.blackListIds[roomId] = true;
};

CommandManager.prototype.hasPermission = function(commandName, roomId) {
    if (this.blackListIds[roomId]) return false;
    if (this.whiteListIds[roomId]) return true;
    if (this.blackLists[commandName]) return false;

    var tempKey = commandName + ":" + roomId;
    if (this.tempPerms[tempKey] && Date.now() < this.tempPerms[tempKey]) {
        return true;
    }

    var permList = this.permLists[commandName];
    return permList ? permList.indexOf(roomId) !== -1 : true;
};

CommandManager.prototype.checkUseLimit = function(commandName) {
    if (!this.useLimits.hasOwnProperty(commandName)) return true;
    var count = this.useCounts[commandName] || 0;
    var max = this.useLimits[commandName];
    if (count >= max) return false;
    this.useCounts[commandName] = count + 1;
    return true;
};

CommandManager.prototype.handleMessage = function(messageData) {
    var Text = messageData.Text;
    var Sender = messageData.Sender;
    var NickName = messageData.NickName;
    if (Text.indexOf("/") !== 0) return;

    var parts = Text.slice(1).split(" ");
    var commandName = parts[0].toLowerCase();
    var args = parts.slice(1);
    var roomId = Sender;

    var command = this.commands[commandName];
    if (!command) {
        this.showHint("Команда \"" + commandName + "\" не найдена");
        return;
    }

    if (!this.hasPermission(commandName, roomId)) {
        this.showHint("Нет прав на \"" + commandName + "\"");
        return;
    }

    if (!this.checkUseLimit(commandName)) {
        this.showHint("Лимит использования \"" + commandName + "\" исчерпан");
        return;
    }

    try {
        command.callback(roomId, args, NickName);
    } catch (error) {
        this.showHint("Ошибка в \"" + commandName + "\": " + error.message);
    }
};

CommandManager.prototype.showHint = function(text) {
    Ui.GetContext().Hint.Value = text;
};

var cmd = new CommandManager(Chat);

cmd.addCommand("say", function(roomId, args, nick) {
    var message = args.join(" ");
    cmd.showHint(nick + ": " + message);
}, "text");

cmd.addCommand("kick", function(roomId, args) {
    var targetId = parseInt(args[0]);
    var player = Players.GetByRoomId(targetId);
    if (player) {
        player.Kick("Kicked via /kick");
        cmd.showHint("Игрок " + targetId + " кикнут");
    } else {
        cmd.showHint("Игрок " + targetId + " не найден");
    }
}, "playerId");

cmd.addCommand("info", function(roomId, args, nick) {
    var playerCount = Players.All.length;
    cmd.showHint("Игроков онлайн: " + playerCount);
});
/* 
cmd.addPermList("kick", [1, 2]);
cmd.addBlackList("say");
cmd.permUse("kick", 3, 300);
cmd.limitedUse("info", 5);
cmd.whiteList(4);
cmd.blackList(5); */ 
}catch(e){
    Ui.GetContext().Hint.Value = 'команды наебнулсб';
}


