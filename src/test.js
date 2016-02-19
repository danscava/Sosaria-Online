var fs = require("fs");

var writer = fs.createWriteStream("test.log", {
    flags: "a"
});

writer.write("Howdy ho there neighbroino!");
writer.write(" And a hi diddly hye!");
writer.write("\n");
writer.end();
