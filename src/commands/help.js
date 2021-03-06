module.exports = {
  data: {
    name: "help",
    description: "ヘルプを表示します。"
  },
  async run(interaction) {
    globalThis.help = {
      "components": [{
        "custom_id": "help_select",
        "placeholder": (interaction.locale == "ja") ?"詳細を見たいコマンドを選択してください。":"Select the command you want to see details about.",
        "options": [{
          "label": `play`,
          "value": "play"
        },
        {
          "label": `create`,
          "value": `create`
        },
        {
          "label": `delete`,
          "value": `delete`
        },
        {
          "label": `myid`,
          "value": `myid`
        }, {
          "label": `point`,
          "value": `point`
        },
        {
          "label": `help`,
          "value": `help`
        },
        {
          "label": `other`,
          "value": `other`
        },
        ],
        "type": 3
      }],
      "type": 1
    };
    interaction.reply({
      ephemeral: true,
      embeds: [{
        color: 0x00ff22,
        title: `help`,
        description: (interaction.locale == "ja") ? `**/play**:概要音楽クイズを開始します。\n**/create**:概要音楽クイズを作成します。\n**/delete**:概要音楽クイズを削除します。\n**/myid**:概要自分のIDの確認とプレイリスト内の音楽を表示します。\n**/point**:概要ポイントの操作を行います。\n**/help**:概要ヘルプを表示します。(この画面です)\nother:概要その他要項を表示します。\n\nping:${globalThis.client.ws.ping}ms\n[サポートサーバー](https://discord.gg/XqymQk4D24)\nプログラム制作:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT管理者:[YURIRI#2724](https://discord.com/users/574104712656191488)\nバグまたは誤字などはBURI#9515まで。\nBOTの質問やサポートサーバー関係はYURIRI#2724まで。` : `**/play**:start overview music quiz \n**/create**: Create a summary music quiz. \n**/delete**: Delete a summary music quiz. \n**/myid**:abstractViews your ID and music in the playlist. \n**/point**:OverviewPoints operation. \n**/help**:OverviewDisplay help. (This screen)\nother:Display overview other information.\n\nping:${globalThis.client.ws.ping}ms\n[Support server](https://discord.gg/XqymQk4D24)\nProgram production:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT administrator:[YURIRI#2724](https://discord.com/users/574104712656191488)\nFor bugs or typographical errors, please contact BURI#9515.\nBOT questions and support server related to YURIRI#2724.`
      }],
      components: [globalThis.help]
    });
  }
};