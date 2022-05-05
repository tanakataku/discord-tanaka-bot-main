module.exports = {
    data: {
        name: "myid",
        description: "独自に割りふられているIDを表示します。"
    },
    async run(interaction) {
        const id = Number(globalThis.moment(interaction.user.createdAt).format("MMDDHHmmss").slice(0, 9)).toString(36);
        if (!await globalThis.dbs.has(id)) return interaction.reply({
            embeds: [{
                ephemeral: true,
                color: 0xff1100,
                title: (interaction.locale == "ja") ? "取得失敗" : "Acquisition failure",
                description: (interaction.locale == "ja") ? `アカウントデータが見つかりませんでした。` : `Account data not found.`
            }]
        });
        const data = JSON.parse(JSON.stringify(await globalThis.dbs.get(id)));
        interaction.reply({
            embeds: [{
                color: 0x00ff22,
                title: (interaction.locale == "ja") ? "取得成功" : "Achieving Success",
                description: (interaction.locale == "ja") ? `**${id}**\n**プレイリスト名**\n${Object.keys(data).join("\n")}\n\n仕組みはアカウント作成日(時分秒)を36進数に直したものです。` : `**${id}**\n**Playlist name**\n${Object.keys(data).join("\n")}\n\nThe mechanism is the date of account creation (hour, minute, second), rearranged into 36 decimal digits. `
            }]
        });
    }
};