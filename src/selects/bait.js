import { EmbedBuilder, ActionRowBuilder, MessageFlags, ButtonBuilder, ButtonStyle } from 'discord.js';

export const select = {
	data: {
        name: 'bait'
    },
	async execute(interaction, userDB, gameManager) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);
        
        const bait = gameManager.itemsData.bait[interaction.values[0]];

        let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Shop',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(bait.name)
            .setDescription(`> Level: ${bait.level_required}\n> Weight modifier: ${bait.weight_modifier*100}%\n> **Price: ${bait.price}**`)
            .setFooter({ text: gameManager.fishData[user.location].name, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        const buyButton = new ButtonBuilder()
            .setCustomId(`buyBait?bait=${interaction.values[0]}`)
            .setLabel('buy')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(buyButton);

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
	},
};