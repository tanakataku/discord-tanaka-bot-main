module.exports = {
    data: {
        name: "point",
        description: "すべてのメンバーのポイントを削除します。",
        options: [{
            type: "STRING",
            name: "point_type",
            description: "オプションを選択してください",
            required: true,
            choices: [
                { name: "ポイント確認", value: "pointcheck" },
                { name: "ポイント削除", value: "pointdelete" },
            ]
        }]
    },
    async run(interaction) {
        if (interaction.options.getString('point_type') === 'pointdelete') {
            if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: "エラー",
                    description: 'あなたには管理者権限がありません。'
                }]
            });
            if (!await globalThis.ranks.has(interaction.guildId)) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: "エラー",
                    description: "データが元々ありません。"
                }]
            })
            await globalThis.ranks.delete(interaction.guildId);
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0x00ff22,
                    title: "成功",
                    description: "データの削除に成功しました。"
                }]
            });
        }
        if (interaction.options.getString('point_type') === 'pointcheck') {
            const datas = JSON.parse(await globalThis.ranks.get(interaction.guildId));
            if (!datas) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: "エラー",
                    description: "サーバーにポイント情報がありません。"
                }]
            });
            let i = 0;
            const tmp = Object.values(datas).map(data => String(data) + Object.keys(datas)[i++]);
            tmp.sort(
                (a, b) => {
                    return b - a;
                }
            );
            let j = 1;
            interaction.reply({
                embeds: [{
                    color: 0x00ff22,
                    title: "ポイント順位",
                    description: tmp.map(d => `${j++}位:${interaction.guild.members.cache.get(d.slice(1))}さん(${Number(d.slice(0, 1)) + 1}ポイント)`).join("\n").slice(0, 2000)
                }]
            });
        }
    }
};