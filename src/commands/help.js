module.exports = {
    data: {
        name: "help",
        description: "help"
    },
    async run(interaction) {
    interaction.reply({
        embeds:[{
            title:"help",
            description:"/create タイトル(検索ワードと答えになります) 選択肢(最大25個60字までできます) プレイリスト(一人5個のプレイリストです。なおプレイリストの中身は10個までとなっています)\n音楽の問題を作成します。\n\n/delete ID(独自に割り振られているIDを入力してください)\nプレイリストを削除します。\n\n/start ID(独自に割り振られているID)または空欄(空欄の場合はランダムで検索します)\n音楽クイズをスタートします。"
        }]
    })
    }
};