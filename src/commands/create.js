const yts = require('yt-search');
const naosu = str => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s=> {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};
module.exports = {
    data: {
        name: "create",
        description: "音楽の問題を作成します。",
        options: [{
            type: "STRING",
            name: "title",
            description: "検索タイトルを入れてください。",
            required: true
        }, {
            type: "STRING",
            name: "question",
            description: ",で区切って選択肢を作ってください。",
            required: true
        }, {
            type: "STRING",
            name: "answer",
            description: "問題の答えを入力してください。",
            required: true
        }, {
            type: "STRING",
            name: "list",
            description: "プレイリスト名を入力してください。",
            required: true
        }],
    },
    async run(interaction) {
        let i = 1;
        await interaction.deferReply({ephemeral: true});
        const sc = interaction.options;
        const title = sc.getString('title');
        const q = naosu(sc.getString('question')).split(",");
        const check = q.map(x=>{
            if(x.length>=85)return interaction.followUp({
                ephemeral: true,
                embeds:[{
                    title:"エラー",
                    description:`${x}\nは85字を超えています`
                }]
            })
        });
        console.log(check)
        if(check[0]!==undefined)return;
        if (!q[0]) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `入力タイプが違います。\n詳細:次の形式で入力してください。\n例:**a,b,c**` }] });
        if (q[25]) return interaction.followUp({ ephemeral: true, embeds: [{ title: "エラー", description: `選択肢が多すぎます、**25個以内**にしてください。` }] });
        q.push(sc.getString('answer'));
        const r = await yts(title);
        const videos = r.videos.slice(0, 15);
        const select_data = {
            "components": [{
                "custom_id": "music_select",
                "placeholder": "対象の曲を選択してください。",
                "options": videos.map(data => {
                    let rand = String(Math.floor(Math.random() * 1000000) + 1);
                    setTimeout(() => {
                        try {
                            delete globalThis[rand];
                        } catch (e) {
                            
                        }
                    }, 180*1000);
                    globalThis[rand] = { u: data.videoId, a: q, p: sc.getString("list") }
                    return {
                        "label": data.title.replace(/\s+/g, "").slice(0, 5),
                        "value": rand
                    };
                }),
                "type": 3
            }],
            "type": 1
        };
        interaction.followUp({
            ephemeral: true,
            embeds: [{
                title: `**${title}**の検索結果`,
                description: videos.map(data => `**${i++}**個目\n**タイトル**:[${data.title.slice(0, 30).replace(/\]/g,"").replace(/\[/g,"")}](${data.url})\n**再生時間**:${data.timestamp}秒`).join("\n\n")
            }],
            components: [select_data]
        });
    }
};