globalThis.moment = require('moment');
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
const feedback = new discordModals.Modal()
  .setCustomId("feedback")
  .setTitle('フィードバックを入力してください。')
  .addComponents(
    new discordModals.TextInputComponent()
      .setCustomId(`input`)
      .setLabel(`運営に届きます。`)
      .setStyle('LONG')
      .setPlaceholder('ここにフィードバックを記入してください。')
      .setRequired(true)
  );
const feedback_button = {
  components: [
    {
      custom_id: `feedback_button`,
      label: "運営にフィードバックをする。",
      style: 1,
      type: 2,
    }
  ],
  type: 1
};
module.exports = {
  async run(interaction) {
    /*

プレイリスト選択

    */
    if (interaction.customId == "music_select") {
      const id = Number(globalThis.moment(interaction.user.createdAt).format("MMDDHHmmss").slice(0, 9)).toString(36);
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
        data[json.p].push({ url: json.u, answer: json.a[json.a.length - 1], q: q, id: interaction.user.id });
        this.playdata = data;
      } else {
        data[json.p] = [{ url: json.u, answer: json.a[json.a.length - 1], q: q, id: interaction.user.id }];
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
      let bugi = 1;
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
      if (!interaction.guild.me.permissionsIn(interaction.member.voice.channel).has("1048576")) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: "エラー",
          description: '私にボイスチャンネル接続権限がないです。'
        }]
      });
      if (!interaction.guild.me.permissionsIn(interaction.member.voice.channel).has('2097152')) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: "エラー",
          description: '私にボイスチャンネル発言権限がないです。'
        }]
      });
      let queue = player.createQueue(interaction.guildId);
      const check = await queue.join(interaction.member.voice.channel)
        .catch(e => interaction.followUp({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: "原因不明なエラー",
            description: `${String(e)}\nもう一度やり直してください。\n解決しない場合はBURI#9515まで。`
          }]
        }));
      if (check.embeds) return;
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
        bugi = 1;
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
              color: 0x00ff22,
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
      const nowrank = rank_data[interaction.user.id];
      if (json.answer == json.user_answer) {
        const rankdata = nowrank + 1 || 0
        rank_data[interaction.user.id] = rankdata;
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
        rank_data[interaction.user.id] = rankdata;
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
    
    
    next
    
    
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

    /*

    stop

    */


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
    };

    /*

    report

    */

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

    /*

    ban

    */
    if (interaction.customId.startsWith("ban")) {
      const id = interaction.customId.slice(3).split(",");
      if (id[1]) await globalThis.dbs.delete(id[1]);
      const bans = JSON.parse(JSON.stringify(await globalThis.bans.get("ban") || []));
      bans.push(id[0]);
      await globalThis.bans.set("ban", bans);
      globalThis.ban = bans;
      interaction.reply("完了しました。");
    };

    /*

    playlist_delete

    */
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

    /*

    music_delete

    */
    if (interaction.customId == "musicdelete") {
      const id = JSON.parse(interaction.values[0]);
      const datas = JSON.parse(JSON.stringify(await globalThis.dbs.get(id.id)));
      const name = Object.keys(datas)[id.num];
      const data = datas[name];
      if (data.length == 1) {
        interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: "警告",
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
      await globalThis.dbs.set(id.id, datas);
      interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0x00ff22,
          title: "削除が完了しました。",
          description: `${id.title}を削除しました。`
        }]
      });
    };

    /*

    help

    */
    if (interaction.customId == "help_select") {
      const id = interaction.values[0];
      await interaction.deferUpdate();
      if (id == "create") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `create-help`,
            description: `コマンド:/play\n詳細コマンド:/create 検索ワード 選択肢 答え プレイリスト名\n\n**詳細説明**\n検索ワードはYoutubeで自動検索される際に検索する言葉を入れてください。\n選択肢はコンマ(,)で区切ってください最大で25個、1個あたり80字まで登録できます。\n答えには問題の答えを入れてください。\nプレイリスト名は最大10個まで作成可能で名前をかぶらせれば自動でつかされていきます。\n概要:音楽の問題を作成します。`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "play") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `play-help`,
            description: `コマンド:/play\n詳細コマンド:/play プレイリストID\n\n**詳細説明**\nプレイリストIDには**/create**で作成された独自のIDを使用してください。\n指定されていない場合またはIDが見つからない場合はランダムで検索されます。\n注**DiscordのIDではありません**\n概要:音楽クイズを開始します。`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "delete") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `delete-help`,
            description: `コマンド:/delete\n詳細コマンド:/delete プレイリストID 音楽削除またはプレイリスト削除を選択\n\n**詳細説明**\nプレイリストIDには**/create**で作成された独自のIDを使用してください。\n注**DiscordのIDではありません**\n音楽削除はプレイリスト内にある音楽を削除します。(注:音楽が1個の場合は使用できません)\nプレイリスト削除はプレイリストを削除します。(注:1この場合はIDごと消されます)\n概要:作成された問題の削除をします。`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "myid") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `myid-help`,
            description: `コマンド:/myid\n詳細コマンド:/myid\n\n**詳細説明**\n自分のIDを確認できます。\n詳細でプレイリスト一覧の名前を出ます。\n概要:IDの確認をします。`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "point") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `point-help`,
            description: `コマンド:/point\n詳細コマンド:/point ポイント確認またはポイント削除\n\n**詳細説明**\nポイント確認はギルド内のポイントを順位をつけて出します。\nポイント削除はギルド内のすべてのユーザーのポイントを消します。(注:1.一度消した場合は取り消しができません。2.管理者権限がないとできません。)\n概要:ポイントの管理をします。`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "other") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `other`,
            description: `**使用パッケージ**\n@discordjs/opus\naurora-mongo\ndiscord-modals\ndiscord-music-player\ndiscord.js\ndotenv\nmoment\nyt-search\n\n**ホスティングサーバー**:Heroku(フリープラン)\n**使用データベース**:Mongo(フリープラン)\n[github](https://github.com/tanakataku/discord-tanaka-bot-main)`
          }],
          components: [globalThis.help, feedback_button]
        });
      };
      if (id == "help") {
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `help`,
            description: `**/play**\n**/create**\n**/delete**\n**/myid**\n**/point**\n**/other**\n**/help**\n\nping:${globalThis.client.ws.ping}ms\n[サポートサーバー](https://discord.gg/XqymQk4D24)\nプログラム制作:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT管理者:管理者:[YURIRI#2724](https://discord.com/users/574104712656191488)\nバグまたは誤字などはBURI#9515まで。\nBOTの質問やサポートサーバー関係はYURIRI#2724まで。`
          }],
          components: [globalThis.help]
        });
      };
    };

    /*

    feedback_button

    */

    if (interaction.customId == "feedback_button") {
      discordModals.showModal(feedback, {
        client: globalThis.client,
        interaction: interaction
      });
    };
    
  }
}