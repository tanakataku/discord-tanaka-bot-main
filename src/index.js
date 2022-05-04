const { Client, Intents } = require('discord.js');
const fs = require("node:fs");
require('dotenv').config();
const mongo = require("aurora-mongo");
mongo.connect(process.env.db);
const db = new mongo.Database(process.env.ban_db_label);
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
globalThis.client = client;
const musicselect = require("./select/musicselect");
const commands = {};
const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith('.js'));
const data = [];
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands[command.data.name] = command;
  data.push(command.data);
};
client.on("ready", async () => {
  globalThis.ban = JSON.parse(JSON.stringify(await db.get("ban") || []));
  client.user.setPresence({ activities: [{ name: '/helpでhelpが見れるよ!' }] });
  await client.application.commands.set(data, "");
  console.log("完了!")
});
client.on("interactionCreate", interaction => {
  if(!interaction.guildId)return interaction.reply("helpは/helpと**サーバーで**打ってください");
  if (globalThis.ban.includes(interaction.user.id)) return;
  if (interaction.isCommand()) {
    try {
      commands[interaction.commandName].run(interaction);
    } catch (e) {
      console.log(e);
    };
  };
  if (interaction.isSelectMenu() || interaction.isButton()) musicselect.run(interaction);
});
client.on('modalSubmit',async modal => {
  if (globalThis.ban.includes(modal.user.id)) return;
  await modal.reply({
    embeds:[{
      title:"ご協力感謝します。"
    }]
  });
  const data = modal.customId.split(",");
  const button = {
    components: [
      {
        custom_id: `ban${data[1]},${data[2]}`,
        label: "クイックBAN",
        style: 4,
        type: 2,
      }
    ],
    type: 1
  };
  client.channels.cache.get(process.env.report_channel).send({
    embeds: [{
      title: "報告",
      description: `対象動画:"https://youtube.com/watch?v=${data[0]}"\n対象ユーザー:${data[1]}\n報告ユーザー:${modal.user.id}(${modal.user.tag})\nプレイリストID:${data[2]}\n報告内容:${modal.getTextInputValue('input')}`
    }],
    components: [button]
  });

});
client.login(process.env.token);