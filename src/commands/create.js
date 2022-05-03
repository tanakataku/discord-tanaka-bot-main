const yts = require('yt-search');
const naosu = str => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};
module.exports = {
    data: {
        name: "create",
        description: "音楽の問題を作成します",
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
        },{
            type: "STRING",
            name: "answer",
            description: "問題の答えを入力してください",
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
        if(sc.getString("list").length>5)return interaction.followUp("タイトルは5字以内にしてください");
        const q = naosu(sc.getString('question')).split(",");
        if (!q[0]) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `入力タイプが違います\n詳細:次の形式で入力してください\n例:a,b,c` }] });
        if (naosu(sc.getString('question')).length > 40) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `選択肢は40字以内` }] });
        if(q[25])return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `選択肢が多すぎます25個以内にしてください。` }] });
        q.push(sc.getString('answer'));
        const r = await yts(title);
        const videos = r.videos.slice(0, 3);
        const select_data = {
            "components": [{
                "custom_id": "music_select",
                "placeholder": "対象の曲を選択してください",
                "options": videos.map(data => {
                    return {
                        "label": data.title.replace(/\s+/g, "").slice(0, 5),
                        "value": JSON.stringify({u:data.videoId,a:q,p:sc.getString("list")})
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
                description: videos.map(data => `${i++}個目\nタイトル:[${data.title.slice(0, 30)}](${data.url})\n再生時間:${data.timestamp}`).join("\n\n")
            }],
            components: [select_data]
        });
    }
};