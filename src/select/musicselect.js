globalThis.moment = require('moment');
const { Player } = require("discord-music-player");
const discordModals = require('discord-modals');
const player = new Player(globalThis.client, {
  leaveOnEmpty: true,
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
/*

player event

*/

module.exports = {
  async run(interaction) {
    player.on('queueEnd', () => {
      const i = this[interaction.guildId];
      if (i) i.reply.delete().catch(() => { });
    })
      .on('error', (error, queue) => {
        console.log(`Error: ${error} in ${queue.guild.name}`);
      });
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
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? "操作が一定時間なかったため、一時データが消されました。\nもう一度やり直してください。" : "The temporary data was erased because there was no operation for a certain period of time. \n Please try again."
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
            title: (interaction.locale == "ja") ? "エラー" : "error",
            description: (interaction.locale == "ja") ? `**5個以上**のプレイリストの登録はできません。` : `**5 or more** playlists cannot be registered. `
          }]
        });
      };
      if (this.playdata[json.p].length == 11) {
        return interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: (interaction.locale == "ja") ? "エラー" : "error",
            description: (interaction.locale == "ja") ? `プレイリスト内に**10個以上**の音楽は保存できません。` : `You cannot save ** 10 or more ** music in a playlist. `
          }]
        });
      };
      await globalThis.dbs.set(id, this.playdata);
      interaction.reply({
        ephemeral: true,
        embeds: [{
          color: 0x00ff22,
          title: (interaction.locale == "ja") ? "完了しました" : "Has completed",
          description: (interaction.locale == "ja") ? `**登録ID**:${id}\n**答え**:${json.a[json.a.length - 1]}\n**選択肢**:${q}\n**プレイリスト名**:${json.p}\n**登録曲数**:${this.playdata[json.p].length}\n**登録プレイリスト数**:${Object.keys(data).length}` : `**Registration ID**:${id}\n**answer**:${json.a[json.a.length - 1]}\n**Choices**:${q}\n**Playlist name**:${json.p}\n**Number of registered songs**:${this.playdata[json.p].length}\n**Number of registered playlists**:${Object.keys(data).length}`
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
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? `ボイスチャンネルに参加してください。` : `Join the voice channel. `
        }]
      });
      if (!interaction.guild.me.permissionsIn(interaction.member.voice.channel).has("1048576")) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? '私にボイスチャンネル接続権限がないです。' : "I don't have voice channel connection rights."
        }]
      });
      if (!interaction.guild.me.permissionsIn(interaction.member.voice.channel).has('2097152')) return interaction.followUp({
        ephemeral: true,
        embeds: [{
          color: 0xff1100,
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? '私にボイスチャンネル発言権限がないです。' : "I don't have voice channel speaking authority. "
        }]
      });
      let queue = player.createQueue(interaction.guildId);
      const check = await queue.join(interaction.member.voice.channel)
        .catch(e => interaction.followUp({
          ephemeral: true,
          embeds: [{
            color: 0xff1100,
            title: (interaction.locale == "ja") ? "原因不明なエラー" : "Unknown error",
            description: (interaction.locale == "ja") ? `${String(e)}\nもう一度やり直してください。\n解決しない場合はBURI#9515まで。` : `${String(e)}\nPlease try again. \nIf it doesn't work, go to BURI#9515.`
          }]
        }));
      if (check.embeds) return;
      this.sound = async num => {
        if (!data[json.playname][num]) return interaction.followUp({
          embeds: [{
            color: 0x00ff22,
            title: (interaction.locale == "ja") ? `お知らせ` : "news",
            description: (interaction.locale == "ja") ? "全音楽の再生が終わりました。" : "All music has finished playing."
          }]
        });

        await queue.play(`https://youtube.com/watch?v=${data[json.playname][num].url}`)
          .catch(_=> {
            queue.stop();
          });
        const select_data = {
          "components": [{
            "custom_id": "answer_select",
            "placeholder": (interaction.locale == "ja") ? "正解だと思う選択肢を選択してください。" : "Select the option that you think is the correct answer.",
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
              label: (interaction.locale == "ja") ? "不適切なプレイリストを報告する。" : "Report an inappropriate playlist.",
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
              title: (interaction.locale == "ja") ? "この音楽の名称を選択してください。" : "Please select the name of this music.",
              description: data[json.playname][num].q.join("\n")
            }],
            components: [select_data, button]
          }),
          num: num
        };
      };
      await this.sound(0);
    };


    /*
   
    答え選択
   
    */
    if (interaction.customId == "answer_select") {
      const data = {
        components: [
          {
            custom_id: "stop",
            label: (interaction.locale == "ja") ? "やめる" : "stop",
            style: 1,
            type: 2,
          },
          {
            custom_id: "next",
            label: (interaction.locale == "ja") ? "次の曲へ" : "next",
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
            title: (interaction.locale == "ja") ? "正解!" : "correct answer!",
            description: (interaction.locale == "ja") ? `**${interaction.user.tag}**さんが正解しました。\n現在のポイント:**${rankdata + 1}P**\n操作を続行するためには、**ボタンを押してください**。` : `**${interaction.user.tag}**answered correctly.\nCurrent point:**${rankdata + 1}P**\nPress the **button to continue the operation**.`
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
            title: (interaction.locale == "ja") ? "不正解!" : "Incorrect answer!",
            description: (interaction.locale == "ja") ? `**${interaction.user.tag}**さんが不正解しました。\n現在のポイント:**${rankdata - 1}P**\n操作を続行するためには、**ボタンを押してください**。` : `**${interaction.user.tag}**Incorrect answer!.\nCurrent point:**${rankdata + 1}P**\nPress the **button to continue the operation**.`
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
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? "**サーバーの再起動**により、メモリーが**初期化**されました。\n初めから操作の**やり直ししてください。**" : "**The server has been **initialized** by restarting the server.\nPlease try the operation **again from the beginning**."
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
          title: (interaction.locale == "ja") ? "エラー" : "error",
          description: (interaction.locale == "ja") ? "**サーバーの再起動**により、メモリーが**初期化**されました。\n初めから操作の**やり直ししてください。**" : "**The server has been **initialized** by restarting the server.\nPlease try the operation **again from the beginning**."
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
        .setTitle((interaction.locale == "ja") ? '内容を入力してください。' : 'Please enter the content.')
        .addComponents(
          new discordModals.TextInputComponent()
            .setCustomId(`input`)
            .setLabel((interaction.locale == "ja") ? `対象プレイリストを運営が審査します。` : `The management will review the target playlist.`)
            .setStyle('LONG')
            .setPlaceholder((interaction.locale == "ja") ? 'ここに報告内容を記入してください。' : 'Please fill in the report here.')
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
      if (id[0] !== "no") await globalThis.bans.set("ban", bans);
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
            title: (interaction.locale == "ja") ? "完了" : "completion",
            description: (interaction.locale == "ja") ? "プレイリストが**0個**になったので、**IDを消去**しました。" : "Since the number of playlists is **0**,**ID has been deleted**."
          }]
        });
      } else {
        await globalThis.dbs.set(id.id, data);
        interaction.reply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: (interaction.locale == "ja") ? "完了" : "completion",
            description: (interaction.locale == "ja") ? "消しました。" : "I erased."
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
            title: (interaction.locale == "ja") ? "警告" : "warning",
            description: (interaction.locale == "ja") ? "プレイリスト内の音楽が0個になるので**/delete プレイリスト削除**コマンドを使用ください。" : "Use the **/delete playlist delete** command as there will be 0 music in the playlist."
          }]
        });
      } else {
        let i = 0;
        const select_data = {
          "components": [{
            "custom_id": "music_delete",
            "placeholder": (interaction.locale == "ja") ? "対象の音楽を選んでください。" : "Please select the target music.",
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
            title: (interaction.locale == "ja") ? "消したい音楽を選択してください。" : "Select the music you want to erase.",
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
          title: (interaction.locale == "ja") ? "削除が完了しました。" : "The deletion is complete.",
          description: (interaction.locale == "ja") ? `${id.title}を削除しました。` : `Removed ${id.title}.`
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
            description: (interaction.locale == "ja") ? `コマンド:/create\n詳細コマンド:/create 検索ワード 選択肢 答え プレイリスト名\n\n**詳細説明**\n検索ワードはYoutubeで自動検索される際に検索する言葉を入れてください。\n選択肢はコンマ(,)で区切ってください最大で25個、1個あたり80字まで登録できます。\n答えには問題の答えを入れてください。\nプレイリスト名は最大10個まで作成可能で名前をかぶらせれば自動でつかされていきます。\n概要:音楽の問題を作成します。` : `Command:/create\nDetailed command:/create Search word Choice Answer Playlist_name\n\n**Detailed explanation**\nThe search word should be the word to be searched when it is automatically searched on Youtube. \nPlease separate the choices with a comma (,). You can register up to 25 characters and 80 characters per item. \nPlease include the answer to the question in the answer. \nYou can create up to 10 playlist names, and if you put a name on it, it will be used automatically. \nSummary: Create a music question.`
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
            description: (interaction.locale == "ja") ? `コマンド:/play\n詳細コマンド:/play プレイリストID\n\n**詳細説明**\nプレイリストIDには**/create**で作成された独自のIDを使用してください。\n指定されていない場合またはIDが見つからない場合はランダムで検索されます。\n注**DiscordのIDではありません**\n概要:音楽クイズを開始します。` : `Command:/play\nDetailed command:/play Playlist_ID\n\n**Detailed description**\nUse the unique ID created by **/create** for the playlist ID. \nIf not specified or the ID is not found, it will be searched randomly.\nNote **Not a Discord ID**\nOverview: Start a music quiz. `
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
            description: (interaction.locale == "ja") ? `コマンド:/delete\n詳細コマンド:/delete {音楽削除またはプレイリスト削除を選択}\n\n**詳細説明**\n音楽削除はプレイリスト内にある音楽を削除します。(注:音楽が1個の場合は使用できません)\nプレイリスト削除はプレイリストを削除します。(注:1この場合はIDごと消されます)\n概要:作成された問題の削除をします。` : `Command:/delete\nDetailed command:/delete {Select to delete music(音楽削除) or delete playlist(プレイリスト削除)} \n\n **Detailed description**\nDelete Music deletes the music in the playlist. (Note: Not available if there is only one piece of music)\n Delete playlist deletes the playlist.(Note:1 In this case, each ID will be deleted.)\n Summary:Delete the created problem.`
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
            description: (interaction.locale == "ja") ? `コマンド:/myid\n詳細コマンド:/myid\n\n**詳細説明**\n自分のIDを確認できます。\n詳細でプレイリスト一覧の名前を出ます。\n概要:IDの確認をします。` : `Command:/myid\nDetailed command:/myid\n\n**Detailed description**\nYou can check your ID.\n Shows the name of the playlist list in detail.\n Summary:Check the ID.`
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
            description: (interaction.locale == "ja") ? `コマンド:/point\n詳細コマンド:/point {ポイント確認またはポイント削除}\n\n**詳細説明**\nポイント確認はギルド内のポイントを順位をつけて出します。\nポイント削除はギルド内のすべてのユーザーのポイントを消します。(注:1.一度消した場合は取り消しができません。2.管理者権限がないとできません。)\n概要:ポイントの管理をします。` : `Command:/point\nDetailed command:/point {Confirm point(ポイント確認) or delete point(ポイント削除)}\n\n**Detailed explanation**\nPoint confirmation ranks points in the guild.\nDelete points erases points for all users in the guild.(Note:1.Once deleted, it cannot be canceled. 2.It cannot be done without administrator privileges.)\nOverview: Manage points.`
          }],
          components: [globalThis.help]
        });
      };
      if (id == "other") {
        const feedback_button = {
          components: [
            {
              custom_id: `feedback_button`,
              label: (interaction.locale == "ja") ? "運営にフィードバックをする。" : "Give feedback to the operation.",
              style: 1,
              type: 2,
            }
          ],
          type: 1
        };
        interaction.editReply({
          ephemeral: true,
          embeds: [{
            color: 0x00ff22,
            title: `other`,
            description: (interaction.locale == "ja") ? `**使用パッケージ**\nopusscript\n@discordjs/opus\naurora-mongo\ndiscord-modals\ndiscord-music-player\ndiscord.js\ndotenv\nmoment\nyt-search\n\n**ホスティングサーバー**:Heroku(フリープラン)\n**使用データベース**:Mongo(フリープラン)\n[github](https://github.com/tanakataku/discord-tanaka-bot-main)` : `**Package used**\nopusscript\n@discordjs/opus\naurora-mongo\ndiscord-modals\ndiscord-music-player\ndiscord.js\ndotenv\nmoment\nyt-search\n\n**Hosting server**:Heroku (free plan)\n**Database used**:Mongo (free plan)\n[github](https://github.com/tanakataku/discord-tanaka-bot-main)`
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
            description: (interaction.locale == "ja") ? `**/play**:概要音楽クイズを開始します。\n**/create**:概要音楽クイズを作成します。\n**/delete**:概要音楽クイズを削除します。\n**/myid**:概要自分のIDの確認とプレイリスト内の音楽を表示します。\n**/point**:概要ポイントの操作を行います。\n**/help**:概要ヘルプを表示します。(この画面です)\nother:概要その他要項を表示します。\n\nping:${globalThis.client.ws.ping}ms\n[サポートサーバー](https://discord.gg/XqymQk4D24)\nプログラム制作:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT管理者:[YURIRI#2724](https://discord.com/users/574104712656191488)\nバグまたは誤字などはBURI#9515まで。\nBOTの質問やサポートサーバー関係はYURIRI#2724まで。` : `**/play**:start overview music quiz \n**/create**: Create a summary music quiz. \n**/delete**: Delete a summary music quiz. \n**/myid**:abstractViews your ID and music in the playlist. \n**/point**:OverviewPoints operation. \n**/help**:OverviewDisplay help. (This screen)\nother:Display overview other information.\n\nping:${globalThis.client.ws.ping}ms\n[Support server](https://discord.gg/XqymQk4D24)\nProgram production:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT administrator:[YURIRI#2724](https://discord.com/users/574104712656191488)\nFor bugs or typographical errors, please contact BURI#9515.\nBOT questions and support server related to YURIRI#2724.`
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