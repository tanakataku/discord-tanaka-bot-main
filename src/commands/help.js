module.exports = {
    data: {
        name: "help",
        description: "help"
    },
    async run(interaction) {
    interaction.reply({
        embeds:[{
            title:"help",
            description:"/create タイトル 選択肢 プレイリスト\nタイトルは検索ワードと答えになります。\n選択肢は最大25個60字まで設定できます\nプレイリストは一人5個までです。また、プレイリストの中身は10個までとなっています。\n概要:音楽の問題を作成します。\n\n/delete ID\nIDは独自に割り振られているものにしてください\n概要:プレイリストを削除します。\n\n/start IDまたは空欄\nIDは独自に割り振られているものにしてください。\n空欄の場合はランダムで検索されます。\n概要:音楽クイズをスタートします。"
        }]
    })
    }
};