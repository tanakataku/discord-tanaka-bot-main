const yts = require('yt-search');
const naosu = str => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};
module.exports = {
    data: {
        name: "create",
        description: "create",
        options: [{
            type: "STRING",
            name: "title",
            description: "検索タイトルを入れてください",
            required: true
        }, {
            type: "STRING",
            name: "question",
            description: ",で区切って選択肢を作ってください",
            required: true
        }, {
            type: "STRING",
            name: "list",
            description: "プレイリスト名を入力してください",
            required: true
        }],
    },
    async run(interaction) {
        let i = 1;
        await interaction.deferReply();
        const sc = interaction.options;
        const title = sc.getString('title');
        if(title.length>10)return interaction.reply("タイトルは10字以内にしてください");
        const q = naosu(sc.getString('question')).split(",");
        if (!q[0]) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `入力タイプが違います\n詳細:次の形式で入力してください\n例:a,b,c` }] });
        if (q.length > 80) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `選択肢は60字以内` }] });
        q.push(sc.getString('title'));
        const r = await yts(title);
        const videos = r.videos.slice(0, 5);
        const select_data = {
            "components": [{
                "custom_id": "music_select",
                "placeholder": "対象の曲を選択してください",
                "options": videos.map(data => {
                    return {
                        "label": data.title.replace(/\s+/g, "").slice(0, 10),
                        "value": JSON.stringify({ url: data.videoId, answer: q, playlist: sc.getString("list") })
                    };
                }),
                "type": 3
            }],
            "type": 1
        };
        interaction.followUp({
            ephemeral: true,
            embeds: [{
                title: `${title}の検索結果`,
                description: videos.map(data => `${i++}個目\nタイトル:${data.title.slice(0, 10)}\n再生時間:${data.timestamp}`).join("\n\n")
            }],
            components: [select_data]
        });
    }
};