const { Client, Intents } = require('discord.js');
const fs = require("node:fs");
require('dotenv').config();
const mongo = require("aurora-mongo");
mongo.connect(process.env.db);

globalThis.dbs = new mongo.Database(process.env.db_label);
globalThis.ranks = new mongo.Database(process.env.rank_db_label);
globalThis.bans = new mongo.Database(process.env.ban_db_label);

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
  globalThis.ban = JSON.parse(JSON.stringify(await globalThis.bans.get("ban") || []));
  client.user.setActivity('/help', { type: 'LISTENING' });
  await client.application.commands.set(data, "");
  console.log(`完了!`)
});
client.on("interactionCreate", interaction => {
  if (!interaction.guildId) return interaction.reply((interaction.locale == "ja") ? "helpは/helpと**サーバーで**打ってください" : "Type help in /help and **on the server**");
  if (globalThis.ban.includes(interaction.user.id)) return interaction.reply({
    ephemeral: true,
    embeds: [{
      color: 0xff1100,
      title: (interaction.locale == "ja") ? "警告" : "warning",
      description: (interaction.locale == "ja") ? "あなたはBANされています。\n間違いの場合はBURI#9515まで。" : "You are banned. \n If you make a mistake, call BURI#9515."
    }]
  });
  if (interaction.isCommand()) {
    try {
      commands[interaction.commandName].run(interaction);
    } catch (e) {
      console.log(e);
    };
  };
  if (interaction.isSelectMenu() || interaction.isButton()) musicselect.run(interaction);
});
client.on('modalSubmit', async modal => {
  if (globalThis.ban.includes(modal.user.id)) return modal.reply({
    ephemeral: true,
    embeds: [{
      color: 0xff1100,
      title: (modal.locale == "ja") ? "警告" : "warning",
      description: (modal.locale == "ja") ? "あなたはBANされています。\n間違いの場合はBURI#9515まで。" : "You are banned. \n If you make a mistake, call BURI#9515."
    }]
  });
  await modal.reply({
    embeds: [{
      color: 0x00ff22,
      title: (modal.locale == "ja") ? "ご協力感謝します。" : "Thank you for your cooperation."
    }]
  });
  if (modal.customId == "feedback") {
    const button2 = {
      components: [
        {
          custom_id: `ban${modal.user.id}`,
          label: "報告ユーザーBAN",
          style: 4,
          type: 2,
        }
      ],
      type: 1
    };
    client.channels.cache.get(process.env.feedback_channel).send({
      embeds: [{
        color: 0xff1100,
        title: "フィードバック",
        description: `ユーザー:${modal.user.id}(${modal.user.tag})\n内容:${modal.getTextInputValue('input')}`
      }],
      components: [button2]
    });
  } else {
    const userid = data[1]
    const data = modal.customId.split(",");
    const button = {
      components: [
        {
          custom_id: `ban${userid},${data[2]}`,
          label: "報告されたユーザーBAN",
          style: 4,
          type: 2,
        }
      ],
      type: 1
    };
    const button3 = {
      components: [
        {
          custom_id: `ban${modal.user.id}`,
          label: "報告ユーザーBAN",
          style: 4,
          type: 2,
        }
      ],
      type: 1
    };
    const button2 = {
      components: [
        {
          custom_id: `banno,${data[2]}`,
          label: "プレイリスト削除",
          style: 4,
          type: 2,
        }
      ],
      type: 1
    };
    client.channels.cache.get(process.env.report_channel).send({
      embeds: [{
        color: 0xff1100,
        title: "報告",
        description: `対象動画:"https://youtube.com/watch?v=${data[0]}"\n対象ユーザー:${userid}\n報告ユーザー:${modal.user.id}(${modal.user.tag})\nプレイリストID:${data[2]}\n報告内容:${modal.getTextInputValue('input')}`
      }],
      components: [button,button2,button3]
    });
  }
});
client.login(process.env.token);