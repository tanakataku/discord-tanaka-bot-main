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
                    title: (interaction.locale == "ja") ? "エラー" : "error",
                    description: (interaction.locale == "ja") ? 'あなたには管理者権限がありません。' : "You do not have administrator privileges."
                }]
            });
            if (!await globalThis.ranks.has(interaction.guildId)) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: (interaction.locale == "ja") ? "エラー" : "error",
                    description: (interaction.locale == "ja") ? "データが元々ありません。" : "Originally there is no data."
                }]
            })
            await globalThis.ranks.delete(interaction.guildId);
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0x00ff22,
                    title: (interaction.locale == "ja") ? "成功" : "success",
                    description: (interaction.locale == "ja") ? "データの削除に成功しました。" : "The data was deleted successfully."
                }]
            });
        }
        if (interaction.options.getString('point_type') === 'pointcheck') {
            const datas = JSON.parse(await globalThis.ranks.get(interaction.guildId));
            if (!datas) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: (interaction.locale == "ja") ? "エラー" : "error",
                    description: (interaction.locale == "ja") ? "サーバーにポイント情報がありません。" : "There is no point information on the server."
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
                    title: (interaction.locale == "ja") ? "ポイント順位" : "Point ranking",
                    description: (interaction.locale == "ja") ? tmp.map(d => `${j++}位:${interaction.guild.members.cache.get(d.slice(1))}さん(${Number(d.slice(0, 1)) + 1}ポイント)`).join("\n").slice(0, 2000) : tmp.map(d => `Rank${j++}:Mr.${interaction.guild.members.cache.get(d.slice(1))}(${Number(d.slice(0, 1)) + 1}point)`).join("\n").slice(0, 2000)
                }]
            });
        }
    }
};