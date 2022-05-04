const mongo = require("aurora-mongo");
const moment = require('moment');
mongo.connect(process.env.db);
const db = new mongo.Database(process.env.db_label);
module.exports = {
    data: {
        name: "myid",
        description: "独自に不利和照られているIDを表示します。"
    },
    async run(interaction) {
        const id = Number(moment(interaction.user.createdAt).format("MMDDHHmmss").slice(0, 9)).toString(36);
        if(!await db.has(id))return interaction.reply({
            embeds:[{
                color:0xff1100,
                title:"取得失敗",
                description:`アカウントデータが見つかりませんでした`
            }]
        });
        const data = JSON.parse(JSON.stringify(await db.get(id)));
    interaction.reply({
        embeds:[{
            color:0x00ff22,
            title:"取得成功",
            description:`**${id}**\n**プレイリスト名**\n${Object.keys(data).join("\n")}\n\n仕組みはアカウント作成日(時分秒)を36進数に直したものです。`
        }]
    });
    }
};