const mongo = require("aurora-mongo");
mongo.connect(process.env.db);
const rank = new mongo.Database(process.env.rank_db_label);
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
                embeds:[{
                    title:"エラー",
                    description:'あなたには管理者権限がありません。'
                }]
            });
            if (!await rank.has(interaction.guildId)) return interaction.reply({
                ephemeral: true,
                embeds: [{
                    title: "エラー",
                    description: "データが元々ありません。"
                }]
            })
            await rank.delete(interaction.guildId);
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    title: "成功",
                    description: "データの削除に成功しました。"
                }]
            });
        }
        if (interaction.options.getString('point_type') === 'pointcheck') {
            const datas = JSON.parse(await rank.get(interaction.guildId));
            if (!datas) return interaction.reply({
                embeds: [{
                    title: "エラー",
                    description: "サーバーにポイント情報がありません.。"
                }]
            });
            let i = 0;
            const tmp = Object.values(datas).map(data =>String(data) + Object.keys(datas)[i++]);
            tmp.sort(
                (a, b) => {
                    return b - a;
                }
            );
            let j = 1;
            interaction.reply({
                embeds: [{
                    title: "help",
                    description: tmp.map(d=>`${j++}位:${interaction.guild.members.cache.get(d.slice(1))}さん(${Number(d.slice(0,1))+1}ポイント)`).join("\n").slice(0,2000)
                }]
            });
        }
    }
};