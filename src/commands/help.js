module.exports = {
    data: {
        name: "help",
        description: "ヘルプを表示します"
    },
    async run(interaction) {
    interaction.reply({
        embeds:[{
            title:"help",
            description:"/create タイトル 選択肢(,で区切ってください) プレイリスト　問題の答え\nタイトルは検索ワードと答えになります。\n選択肢は最大25個50字まで設定できます。注意,で区切ってください(例:a,b,c)\nプレイリストは一人5個までです。また、プレイリストの中身は10個までとなっています。\n概要:音楽の問題を作成します。\n\n/delete ID\nIDは独自に割り振られているものにしてください。\n概要:プレイリストを削除します。\n\n/start IDまたは空欄\nIDは独自に割り振られているものにしてください。\n空欄の場合はランダムで検索されます。\n概要:音楽クイズをスタートします。\n\n/deletepoint\nサーバーのユーザーポイントを削除します。"
        }]
    })
    }
};