const yts = require('yt-search');
const naosu = str => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};
module.exports = {
    data: {
        name: "create",
        description: "音楽の問題を作成します。",
        options: [{
            type: "STRING",
            name: "search",
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
        let n = 1;
        await interaction.deferReply({ ephemeral: true });
        const sc = interaction.options;
        const title = sc.getString('search');
        const q = naosu(sc.getString('question')).split(",");
        const check = q.map(x => {
            if (x.length >= 85) return interaction.followUp({
                ephemeral: true,
                embeds: [{
                    color: 0xff1100,
                    title: (interaction.locale == "ja") ? "エラー" : "error",
                    description: (interaction.locale == "ja") ? `${x}\nは85字を超えています。` : `${x}\n is over 85 characters. `
                }]
            })
        });
        if (check[0] !== undefined) return;
        if (!q[0]) return interaction.followUp({ ephemeral: true, embeds: [{ title: (interaction.locale == "ja") ? "エラー" : "error", description: (interaction.locale == "ja") ? `入力タイプが違います。\n詳細:次の形式で入力してください。\n例:**a,b,c**` : `Input type is different. \nDetails:Please input in the following format. \nExample:**a,b,c**` }] });
        if (q[25]) return interaction.followUp({ ephemeral: true, embeds: [{ title: (interaction.locale == "ja") ? "エラー" : "error", description: (interaction.locale == "ja") ? `選択肢が多すぎます、**25個以内**にしてください。` : "Too many choices, please keep it to **25 or less**." }] });
        q.push(sc.getString('answer'));
        const r = await yts(title);
        const videos = r.videos.slice(0, 10);
        if (!videos[0]) return interaction.followUp({
            ephemeral: true,
            embeds: [{
                color: 0xff1100,
                title: (interaction.locale == "ja") ? "エラー" : "error",
                description: (interaction.locale == "ja") ? "動画が見つかりませんでした。" : "Video not found."
            }]
        });
        const select_data = {
            "components": [{
                "custom_id": "music_select",
                "placeholder": (interaction.locale == "ja") ? "対象の曲を選択してください。" : "Please select the target song.",
                "options": videos.map(data => {
                    let rand = String(Math.floor(Math.random() * 1000000) + 1);
                    setTimeout(() => {
                        try {
                            delete globalThis[rand];
                        } catch (e) {

                        }
                    }, 120 * 1000);
                    globalThis[rand] = { u: data.videoId, a: q, p: sc.getString("list") }
                    return {
                        "label": `${n++}:${data.title.replace(/\s+/g, "").slice(0, 5)}`,
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
                color: 0x00ff22,
                title: (interaction.locale == "ja") ? `**${title.slice(0, 15)}**の検索結果` : `Search results for **${title.slice(0, 15)}**`,
                description: (interaction.locale == "ja") ? videos.map(data => `**${i++}**個目\n**タイトル**:[${data.title.slice(0, 30).replace(/\]/g, "").replace(/\[/g, "")}](${data.url})\n**再生時間**:${data.timestamp}秒`).join("\n\n") : videos.map(data => `**${i++}**Item\n**Title**:[${data.title.slice(0, 30).replace(/\]/g, "").replace(/\[/g, "")}](${data.url})\n**Playback time**:${data.timestamp}s`).join("\n\n")
            }],
            components: [select_data]
        });
    }
};