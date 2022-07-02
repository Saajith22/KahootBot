import client from "../index";

client.on("guildCreate", async (guild) => {
  const channel = guild.systemChannel;
  await channel.send("Sup!");
});
