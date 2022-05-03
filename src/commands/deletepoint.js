const mongo = require("aurora-mongo");
mongo.connect(process.env.db);
const rank = new mongo.Database(process.env.rank_db_label);
module.exports = {
    data: {
        name: "deletepoint",
        description: "すべてのメンバーのポイントを削除します。"
    },
    async run(interaction) {
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) return message.channel.send('あなたには管理者権限がありません');
        if(!await rank.has(interaction.guildId)) return interaction.reply({
            ephemeral: true,
            embeds:[{
                title:"エラー",
                description:"データが元々ありません。"
            }]
        })
      await rank.delete(interaction.guildId);
      interaction.reply({
        ephemeral: true,
        embeds:[{
            title:"成功",
            description:"データの削除に成功しました。"
        }]
    })
    }
};