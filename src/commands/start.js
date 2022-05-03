const mongo = require("aurora-mongo");
mongo.connect(process.env.db);
const db = new mongo.Database(process.env.db_label);
module.exports = {
    data: {
        name: "start",
        description: "音楽クイズを開始します",
        options: [{
            type: "STRING",
            name: "id",
            description: "IDを入れてください何もない場合はランダム"
        }],
    },
    async run(interaction) {
        const id = interaction.options.getString('id')?.toLowerCase();
        const check = (await db.has(id)) ? [id] : await db.keys();
        const use_data = check[Math.floor(Math.random() * check.length)];
        const data = await db.get(use_data);
        if (!data) return interaction.reply("問題が一つも登録されていない\nもしくはDBの故障です");
        const select_data = {
            "components": [{
                "custom_id": "start_select",
                "placeholder": "対象のプレイリストを選択してください",
                "options": Object.keys(data).map(item => {
                    return {
                        "label": item,
                        "value": JSON.stringify({ id: use_data, playname: item })
                    };
                }),
                "type": 3
            }],
            "type": 1
        };
        const json = JSON.parse(JSON.stringify(data));
        interaction.reply({
            embeds: [{
                title: `${use_data}の検索結果`,
                description: `プレイリストタイトル\n${Object.keys(json).map(datas => `${datas},曲数:${json[datas].length}`).join("\n")}`
            }],
            components: [select_data]
        });
    }
};