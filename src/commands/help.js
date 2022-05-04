module.exports = {
    data: {
        name: "help",
        description: "ヘルプを表示します。"
    },
    async run(interaction) {
    interaction.reply({
        embeds:[{
            title:"help",
            description:`**/create** **検索音楽名** **選択肢**(,で区切ってください) **プレイリスト名**　**問題の答え**\nタイトルは**検索ワード**の答えになります。\n選択肢は最大**25個**まで設定できます。注意,で区切ってください(例:a,b,c)\nプレイリストは一人**5個**までです。また、プレイリストの中身は**10個**までとなっています。\n概要:音楽の問題を作成します。\n\n**/delete** **ID** 音楽削除またはプレイリスト削除\nIDは**独自に割り振られているもの**にしてください。\n概要:プレイリストまたはプレイリスト内の音楽を削除します。\n\n**/play** **ID**または**空欄**\nIDは**独自に割り振られているもの**にしてください。\n**空欄の場合**はランダムで検索されます。\n概要:音楽クイズをスタートします。\n\n**/point** ポイント確認またはポイント削除\n概要:サーバーの**すべてのユーザーポイント**を削除または確認します。\n\n製作者:[BURI#9515](https://discord.com/users/672422208089489413)\nバグまたは誤字の報告はBURI#9515まで。\n[サポートサーバー](https://discord.gg/XqymQk4D24)\n[github](https://github.com/tanakataku/discord-tanaka-bot-main)\nping:${client.ws.ping}ms\n\n**使用パッケージ**\n@discordjs/opus\naurora-mongo\ndiscord-modals\ndiscord-music-player\ndiscord.js\ndotenv\nmoment\nyt-search`
        }]
    })
    }
};