const mongo = require("aurora-mongo");
mongo.connect(process.env.db);
const db = new mongo.Database(process.env.db_label);
module.exports = {
    data: {
        name: "delete",
        description: "delete",
        options: [{
            type: "STRING",
            name: "playid",
            description: "プレイリストのIDを入力してください",
            required: true
        }]
    },
    async run(interaction) {
        const id = interaction.options.getString('playid')?.toLowerCase();
        const data = JSON.parse(JSON.stringify(await db.get(id)||[]));
        if(data==[]) return interaction.reply({
            ephemeral: true,
            embeds:[{
                title:"エラー",
                description:"プレイリストIDが見つかりませんでした"
            }]
        });
        if(data[Object.keys(data)[0]][0].id!==interaction.user.id) return interaction.reply({
            ephemeral: true,
            embeds:[{
                title:"エラー",
                description:"ユーザーIDが一致しません"
            }]
        });
        let i = 0;
        const select_data = {
            "components": [{
                "custom_id": "delete",
                "placeholder": "対象のプレイリストを選択してください",
                "options": Object.keys(data).map(item => {
                    return {
                        "label": item,
                        "value": JSON.stringify({ id:id , num: i++ })
                    };
                }),
                "type": 3
            }],
            "type": 1
        };
        interaction.reply({
            ephemeral: true,
            embeds:[{
                title:"消したいプレイリストを選択してください",
                description:Object.keys(data).join("\n")
            }],
            components:[select_data]
        })
    }
};