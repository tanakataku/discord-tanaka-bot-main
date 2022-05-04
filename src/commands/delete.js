
module.exports = {
    data: {
        name: "delete",
        description: "指定のものを削除します。",
        options: [{
            type: "STRING",
            name: "playid",
            description: "プレイリストのIDを入力してください。",
            required: true
        }, {
            type: "STRING",
            name: "delete_type",
            description: "オプションを選択してください",
            required: true,
            choices: [
                { name: "音楽削除", value: "musicdelete" },
                { name: "プレイリスト削除", value: "play_listdelete" },
            ]
        }]
    },
    async run(interaction) {
        if (interaction.options.getString('delete_type') === 'play_listdelete') {
            const id = interaction.options.getString('playid')?.toLowerCase();
            const datas = await globalThis.dbs.get(id)
            const data = JSON.parse(JSON.stringify(datas || []));
            if (!datas) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0xff1100,
                    title: "エラー",
                    description: "プレイリストIDが見つかりませんでした。"
                }]
            });
            if (parseInt(data[Object.keys(data)[0]][0].id, 36) !== interaction.user.id) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0xff1100,
                    title: "エラー",
                    description: "ユーザーIDが一致しません。"
                }]
            });
            let i = 0;
            const select_data = {
                "components": [{
                    "custom_id": "delete",
                    "placeholder": "対象のプレイリストを選択してください。",
                    "options": Object.keys(data).map(item => {
                        return {
                            "label": item,
                            "value": JSON.stringify({ id: id, num: i++ })
                        };
                    }),
                    "type": 3
                }],
                "type": 1
            };
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0x00ff22,
                    title: "**消したいプレイリスト**を選択してください。",
                    description: Object.keys(data).join("\n")
                }],
                components: [select_data]
            });
        }
        if (interaction.options.getString('delete_type') === 'musicdelete') {
            const id = interaction.options.getString('playid')?.toLowerCase();
            const datas = await globalThis.dbs.get(id);
            const data = JSON.parse(JSON.stringify(datas || []));
            if (!datas) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0xff1100,
                    title: "エラー",
                    description: "プレイリストIDが見つかりませんでした。"
                }]
            });
            if(!data[Object.keys(data)[0]][0])return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0xff1100,
                    title: "エラー",
                    description: "ユーザーIDが見つかりませんでした。"
                }]
            });
            if (parseInt(data[Object.keys(data)[0]][0].id, 36)  !== interaction.user.id) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0xff1100,
                    title: "エラー",
                    description: "ユーザーIDが一致しません。"
                }]
            });
            let i = 0;
            const select_data = {
                "components": [{
                    "custom_id": "musicdelete",
                    "placeholder": "対象のプレイリストを選択してください。",
                    "options": Object.keys(data).map(item => {
                        return {
                            "label": item,
                            "value": JSON.stringify({ id: id, num: i++,title:item })
                        };
                    }),
                    "type": 3
                }],
                "type": 1
            };
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    color:0x00ff22,
                    title: "**消したいプレイリスト**を選択してください。",
                    description: Object.keys(data).join("\n")
                }],
                components: [select_data]
            });
        }
    }
};