import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
	data: new SlashCommandBuilder()
		.setName('locations')
		.setDescription('List fishing spots.')
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, gameManager) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);

        var desc = '';

        gameManager.fishData.forEach((location) => {
            desc += `- ${location.name} (requires lvl ${location.level_required})\n    > ${location.description}\n`;
        });

        let embed = new EmbedBuilder()
            .setAuthor({
                name: 'Locations',
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle('Fishing Spots')
            .setDescription(desc)
            .setFooter({ text: `Lvl${user.level}  |  ${gameManager.fishData[user.location].name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [] });
	},
};