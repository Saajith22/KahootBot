import client from "../index";

client.on("ready", () => {
  console.log(`${client.user.username} is now ready to play!!`.magenta);
});
