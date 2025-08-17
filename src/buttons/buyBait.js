import { EmbedBuilder } from 'discord.js';

export const button = {
    data: {
        name: 'buyBait'
    },
    async execute(interaction, userDB, gameManager) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);
        
        const params = new URLSearchParams(interaction.customId.split('?')[1]);
        const bait = gameManager.itemsData.bait[params.get('bait')];

        interaction.reply(JSON.stringify(bait))
    },
};