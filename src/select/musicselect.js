const moment = require('moment');
const { Player } = require("discord-music-player");
const discordModals = require('discord-modals');
const player = new Player(globalThis.client, {
  leaveOnEmpty: false,
});
discordModals(globalThis.client);
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
      const id = Number(moment(interaction.user.createdAt).format("MMDDHHmmss").slice(0, 9)).toString(36);
      const json = globalThis[interaction.values[0]];
      if (!json) return interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: "エラー",
          description: "操作が一定時間なかったため、一時データが消されました。\nもう一度やり直してください。"
        }]
      })
      try {
        delete globalThis[interaction.values[0]]
      } catch (e) {

      }
      const q = shuffle(json.a);
      const db_data = await globalThis.dbs.get(id);
      const data = JSON.parse(JSON.stringify(db_data || {}));
      if (data[json.p]) {
        data[json.p].push({ url: json.u, answer: json.a[json.a.length - 1], q: q, id: Number(interaction.user.id).toString(36) });
        this.playdata = data;
      } else {
        data[json.p] = [{ url: json.u, answer: json.a[json.a.length - 1], q: q, id: Number(interaction.user.id).toString(36) }];
        this.playdata = data;
      };
      if (Object.keys(data).length == 6) {
        return interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: "エラー",
            description: `**5個以上**のプレイリストの登録はできません。`
          }]
        });
      };
      if (this.playdata[json.p].length == 11) {
        return interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: "エラー",
            description: `プレイリスト内に**10個以上**の音楽は保存できません。`
          }]
        });
      };
      await globalThis.dbs.set(id, this.playdata);
      interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0x00ff22,
          title: "完了しました",
          description: `**登録ID**:${id}\n**答え**:${json.a[json.a.length - 1]}\n**選択肢**:${q}\n**プレイリスト名**:${json.p}\n**登録曲数**:${this.playdata[json.p].length}\n**登録プレイリスト数**:${Object.keys(data).length}`
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
      const data = JSON.parse(JSON.stringify(await globalThis.dbs.get(json.id)));
      if (!interaction.member.voice.channel) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: "エラー",
          description: `ボイスチャンネルに参加してください。`
        }]
      });
      let queue = player.createQueue(interaction.guildId);
      await queue.join(interaction.member.voice.channel);
      this.sound = async num => {
        if (!data[json.playname][num]) return interaction.followUp({
          embeds: [{
            color: 0x00ff22,
            title: `お知らせ`,
            description: "全音楽の再生が終わりました。"
          }]
        });
        let guildQueue = player.getQueue(interaction.guildId);
        await queue.play(`https://youtube.com/watch?v=${data[json.playname][num].url}`)
          .catch(_ => {
            if (!guildQueue) queue.stop();
          });
        const select_data = {
          "components": [{
            "custom_id": "answer_select",
            "placeholder": "正解だと思う選択肢を選択してください。",
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
              label: "不適切なプレイリストを報告する。",
              style: 4,
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
      if (i) i.reply.delete().catch(() => { });
      const ranks = await globalThis.ranks.get(interaction.guildId);
      let rank_data = JSON.parse(ranks ?? "{}");
      const nowrank = rank_data[Number(interaction.user.id).toString(36)];
      if (json.answer == json.user_answer) {
        const rankdata = nowrank + 1 || 0
        rank_data[Number(interaction.user.id).toString(36)] = rankdata;
        await globalThis.ranks.set(interaction.guildId, JSON.stringify(rank_data));
        interaction.channel.send({
          embeds: [{
            color: 0x00ff22,
            title: "正解!",
            description: `**${interaction.user.tag}**さんが正解しました。\n現在のポイント:**${rankdata + 1}P**\n操作を続行するためには、**ボタンを押してください**。`
          }],
          components: [data]
        });
      } else {
        const rankdata = nowrank - 1 || 0
        rank_data[Number(interaction.user.id).toString(36)] = rankdata;
        await globalThis.ranks.set(interaction.guildId, JSON.stringify(rank_data));
        interaction.channel.send({
          embeds: [{
            color: 0xff1100,
            title: "不正解!",
            description: `**${interaction.user.tag}**さんが不正解しました。\n現在のポイント:**${rankdata - 1}P**\n操作を続行するためには、**ボタンを押してください**。`
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
          color: 0xff1100,
          title: "エラー",
          description: "**サーバーの再起動**により、メモリーが**初期化**されました。\n初めから操作の**やり直ししてください。**"
        }]
      });
      await this.sound(i.num + 1);
      player.getQueue(interaction.guildId).skip();
      await interaction.deferUpdate().catch(() => { });
    }



    if (interaction.customId == "stop") {
      interaction.deleteReply()
        .catch(() => {

        });
      const i = this[interaction.guildId];
      if (!i) return interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: "エラー",
          description: "**サーバーの再起動**により、メモリーが**初期化**されました。\n初めから操作の**やり直ししてください。**"
        }]
      });
      const guild = player.getQueue(interaction.guildId);
      guild.stop();
      guild.clearQueue();
      await interaction.deferUpdate().catch(() => { });
    }

    if (interaction.customId.startsWith("re")) {
      const url = interaction.customId.slice(2);
      const modal = new discordModals.Modal()
        .setCustomId(url)
        .setTitle('内容を入力してください。')
        .addComponents(
          new discordModals.TextInputComponent()
            .setCustomId(`input`)
            .setLabel(`対象プレイリストを運営が審査します。`)
            .setStyle('LONG')
            .setPlaceholder('ここに報告内容を記入してください。')
            .setRequired(true)
        );
      discordModals.showModal(modal, {
        client: globalThis.client,
        interaction: interaction
      });
    };
    if (interaction.customId.startsWith("ban")) {
      const id = interaction.customId.slice(3).split(",");
      await globalThis.dbs.delete(id[1]);
      const bans = JSON.parse(JSON.stringify(await globalThis.bans.get("ban") || []));
      bans.push(id[0]);
      await globalThis.bans.set("ban", bans);
      globalThis.ban = bans;
      interaction.reply("完了しました。");
    };

    if (interaction.customId == "delete") {
      const id = JSON.parse(interaction.values[0]);
      const data = JSON.parse(JSON.stringify(await globalThis.dbs.get(id.id)));
      delete data[Object.keys(data)[id.num]]
      if (Object.keys(data).length == 0) {
        await globalThis.dbs.delete(id.id);
        interaction.reply({
          color: 0x00ff22,
          ephemeral: true,
          embeds: [{
            title: "完了",
            description: "プレイリストが**0個**になったので、**IDを消去**しました。"
          }]
        });
      } else {
        await globalThis.dbs.set(id.id, data);
        interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: "完了",
            description: "消しました。"
          }]
        });
      };
    };
    if (interaction.customId == "musicdelete") {
      const id = JSON.parse(interaction.values[0]);
      const datas = JSON.parse(JSON.stringify(await globalThis.dbs.get(id.id)));
      const name = Object.keys(datas)[id.num];
      const data = datas[name]
      if (data.length == 1) {
        interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: "完了",
            description: "プレイリスト内の音楽が0個になるので**/delete プレイリスト削除**コマンドを使用ください。"
          }]
        });
      } else {
        let i = 0;
        const select_data = {
          "components": [{
            "custom_id": "music_delete",
            "placeholder": "対象の音楽を選んでください。",
            "options": data.map(item => {
              return {
                "label": `${i}:${item.answer}`,
                "value": JSON.stringify({ id: id.id, num: i++, title: name })
              };
            }),
            "type": 3
          }],
          "type": 1
        };
        interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: "消したい音楽を選択してください。",
            description: data.map(x => x.answer).join("\n")
          }],
          components: [select_data]
        });
      }
    };
    if (interaction.customId == "music_delete") {
      const id = JSON.parse(interaction.values[0]);
      const datas = JSON.parse(JSON.stringify(await globalThis.dbs.get(id.id)));
      delete datas[id.title][id.num]
      const fotdata = datas[id.title].filter(x => x);
      datas[id.title] = fotdata
      await globalThis.dbs.set(id.id, datas)
      interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0x00ff22,
          title: "削除が完了しました。",
          description: `${id.title}を削除しました。`
        }]
      });
    };
  }
}