const moment = require('moment');
const mongo = require("aurora-mongo");
const { Player } = require("discord-music-player");
const discordModals = require('discord-modals')
const player = new Player(globalThis.client, {
  leaveOnEmpty: false,
});
discordModals(globalThis.client);
globalThis.player = player;
mongo.connect(process.env.db);
const rank = new mongo.Database(process.env.rank_db_label);
const db = new mongo.Database(process.env.db_label);
const bandb = new mongo.Database(process.env.ban_db_label);
const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  };
  return array;
};
module.exports = {
  async run(interaction) {
    /*

プレイリスト選択

    */
    if (interaction.customId == "music_select") {
      const id = Number(moment(interaction.user.createdAt).format("MMDDHHmmss").slice(0, 9)).toString(16);
      const json = JSON.parse(interaction.values[0]);
      const q = shuffle(json.a);
      const db_data = await db.get(id);
      const data = JSON.parse(JSON.stringify(db_data || {}));
      if (data[json.p]) {
        data[json.p].push({ url: json.u, answer: json.a[json.a.length - 1], q: q });
        this.playdata = data;
      } else {
        data[json.p] = [{ url: json.u, answer: json.a[json.a.length - 1], q: q, id: interaction.user.id }];
        this.playdata = data;
      };
      if (Object.keys(data).length == 6) {
        return interaction.reply({
          ephemeral: true,
          embeds: [{
            title: "エラー",
            description: `5個以上のプレイリストの登録はできません`
          }]
        });
      };
      if (this.playdata[json.p].length == 11) {
        return interaction.reply({
          ephemeral: true,
          embeds: [{
            title: "エラー",
            description: `プレイリスト内に10個以上の音楽は保存できません`
          }]
        });
      };
      await db.set(id, this.playdata);
      interaction.reply({
        ephemeral: true,
        embeds: [{
          title: "完了しました",
          description: `登録ID:${id}\n答え:${json.a[json.a.length - 1]}\n選択肢:${q}\nプレイリスト名:${json.p}\n登録曲数:${this.playdata[json.p].length}\n登録プレイリスト数:${Object.keys(data).length}`
        }]
      });
    };
    /*
    
    
    再生
    
    
    */
    if (interaction.customId == "start_select") {
      await interaction.deferUpdate();
      let bugi = 0;
      const json = JSON.parse(interaction.values[0]);
      const data = JSON.parse(JSON.stringify(await db.get(json.id)));
      if (!interaction.member.voice.channel) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          title: "エラー",
          description: `ボイスチャンネルに参加してください。`
        }]
      });
      let queue = player.createQueue(interaction.guildId);
      await queue.join(interaction.member.voice.channel);
      this.sound = async num => {
        if (!data[json.playname][num]) return interaction.followUp({
          embeds: [{
            title: `お知らせ`,
            description: "全音楽の再生が終わりました。"
          }]
        });
        await queue.play(`https://youtube.com/watch?v=${data[json.playname][num].url}`)
          .catch(() => {
          });
        const select_data = {
          "components": [{
            "custom_id": "answer_select",
            "placeholder": "正解だと思う選択肢を選択してください",
            "options": data[json.playname][num].q.map(item => {
              return {
                "label": `${bugi++}:${item.slice(0, 10)}`,
                "value": JSON.stringify({ bug: bugi, answer: data[json.playname][num].answer, user_answer: item })
              };
            }),
            "type": 3
          }],
          "type": 1
        };
        const button = {
          components: [
            {
              custom_id: `re${data[json.playname][num].url},${data[json.playname][num].id},${json.id}`,
              label: "不適切な利用を報告する",
              style: 1,
              type: 2,
            }
          ],
          type: 1
        };
        this[interaction.guildId] = {
          reply: await interaction.channel.send({
            embeds: [{
              title: "この音楽の名称を選択してください。",
              description: data[json.playname][num].q.join("\n")
            }],
            components: [select_data, button]
          }),
          num: num
        };
      };
      await this.sound(0);

    };

    player.on('queueEnd', () => {
      const i = this[interaction.guildId];
      if (i) i.reply.delete().catch(() => { });
    });
    /*
  
    答え選択
  
    */
    if (interaction.customId == "answer_select") {
      const data = {
        components: [
          {
            custom_id: "stop",
            label: "やめる",
            style: 1,
            type: 2,
          },
          {
            custom_id: "next",
            label: "次の曲へ",
            style: 1,
            type: 2,
          }
        ],
        type: 1
      };
      const json = JSON.parse(interaction.values[0]);
      const i = this[interaction.guildId];
      if(i)i.reply.delete().catch(() => { });
      const ranks = await rank.get(interaction.guildId);
      let rank_data = JSON.parse(ranks??"{}");
      const nowrank = rank_data[interaction.user.id];
      if (json.answer == json.user_answer) {
        const rankdata= nowrank+1||0
        rank_data[interaction.user.id]=rankdata;
        await rank.set(interaction.guildId,JSON.stringify(rank_data));
        interaction.channel.send({
          embeds: [{
            title: "正解!",
            description: `${interaction.user.tag}さんが正解しました。\n現在のポイント:${rankdata+1}P\n操作を続行するためにボタンを押してください。`
          }],
          components: [data]
        });
      } else {
        const rankdata= nowrank-1||0
        rank_data[interaction.user.id]=rankdata;
        await rank.set(interaction.guildId,JSON.stringify(rank_data));
        interaction.channel.send({
          embeds: [{
            title: "不正解!",
            description: `${interaction.user.tag}さんが不正解しました。\n現在のポイント:${rankdata-1}P\n操作を続行するためにボタンを押してください。`
          }],
          components: [data]
        });
      };
    };

    /*


    button


    */

    if (interaction.customId == "next") {
      interaction.deleteReply()
        .catch(() => {

        });
      const i = this[interaction.guildId];
      if (!i) return interaction.reply({
        ephemeral: true,
        embeds: [{
          title: "エラー",
          description: "サーバーの再起動により、メモリーが初期化されました。\n初めから操作のやり直しを行ってください。"
        }]
      });
      await this.sound(i.num + 1);
      player.getQueue(interaction.guildId).skip();
      await interaction.deferUpdate().catch(()=>{});
    }



    if (interaction.customId == "stop") {
      interaction.deleteReply()
        .catch(() => {

        });
      const i = this[interaction.guildId];
      if (!i) return interaction.reply({
        ephemeral: true,
        embeds: [{
          title: "エラー",
          description: "サーバーの再起動により、メモリーが初期化されました。\n初めから操作のやり直しを行ってください。"
        }]
      });
      const guild = player.getQueue(interaction.guildId);
      guild.stop();
      guild.clearQueue();
      await interaction.deferUpdate().catch(()=>{});
    }

    if (interaction.customId.startsWith("re")) {
      const url = interaction.customId.slice(2);
      const modal = new discordModals.Modal()
        .setCustomId(url)
        .setTitle('内容を入力してください。')
        .addComponents(
          new discordModals.TextInputComponent()
            .setCustomId(`input`)
            .setLabel(`審査します`)
            .setStyle('LONG')
            .setPlaceholder('ここに報告内容を記入してください')
            .setRequired(true)
        );
      discordModals.showModal(modal, {
        client: globalThis.client,
        interaction: interaction
      });
    };
    if (interaction.customId.startsWith("ban")) {
      const id = interaction.customId.slice(3).split(",");
      await db.delete(id[1]);
      const bans = JSON.parse(JSON.stringify(await bandb.get("ban") || []));
      bans.push(id[0]);
      await bandb.set("ban", bans);
      globalThis.ban = bans;
      interaction.reply("完了しました");
    };

    if (interaction.customId == "delete") {
      const id = JSON.parse(interaction.values[0]);
      const data = JSON.parse(JSON.stringify(await db.get(id.id)));
      delete data[Object.keys(data)[id.num]]
      if (Object.keys(data).length == 0) {
        await db.delete(id.id);
        interaction.reply({
          ephemeral: true,
          embeds: [{
            title: "完了",
            description: "プレイリストが0個になったのでIDで消去しました"
          }]
        });
      } else {
        await db.set(id.id, data);
        interaction.reply({
          ephemeral: true,
          embeds: [{
            title: "完了",
            description: "消しました。"
          }]
        });
      };
    };
  }
}