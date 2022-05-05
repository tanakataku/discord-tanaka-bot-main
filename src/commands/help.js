module.exports = {
    data: {
        name: "help",
        description: "ヘルプを表示します。"
    },
    async run(interaction) {
        globalThis.help = {
            "components": [{
              "custom_id": "help_select",
              "placeholder": "詳細を見たいコマンドを選択してください。",
              "options":[{
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
                  },{
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
                description: `**/play**\n**/create**\n**/delete**\n**/myid**\n**/point**\n**/help**\n**other**\n\nping:${globalThis.client.ws.ping}ms\n[サポートサーバー](https://discord.gg/XqymQk4D24)\nプログラム制作:[BURI#9515](https://discord.com/users/672422208089489413)\nBOT管理者:管理者:[YURIRI#2724](https://discord.com/users/574104712656191488)\nバグまたは誤字などはBURI#9515まで。\nBOTの質問やサポートサーバー関係はYURIRI#2724まで。`
            }],
            components:[globalThis.help]
        });
    }
};