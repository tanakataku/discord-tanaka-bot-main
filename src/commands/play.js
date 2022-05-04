module.exports = {
    data: {
        name: "play",
        description: "音楽クイズを開始します。",
        options: [{
            type: "STRING",
            name: "id",
            description: "IDを入れてください何もない場合はランダムになります。"
        }],
    },
    async run(interaction) {
        const id = interaction.options.getString('id')?.toLowerCase();
        const check = (await globalThis.dbs.has(id)) ? [id] : await globalThis.dbs.keys();
        const use_data = check[Math.floor(Math.random() * check.length)];
        const data = await globalThis.dbs.get(use_data);
        if (!data) return interaction.reply({
            ephemeral: true,
            embeds: [{
                color: 0xff1100,
                title: "エラー",
                description: "問題が一つも登録されていない。\nもしくはDBの故障です。"
            }]
        });
        const select_data = {
            "components": [{
                "custom_id": "start_select",
                "placeholder": "対象のプレイリストを選択してください。",
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
                color: 0x00ff22,
                title: `**${use_data}**の検索結果`,
                description: `**プレイリストタイトル**\n${Object.keys(json).map(datas => `${datas},曲数:${json[datas].length}`).join("\n")}`
            }],
            components: [select_data]
        });
    }
};