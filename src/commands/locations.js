import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "node:fs";

export const command = {
	data: new SlashCommandBuilder()
		.setName('locations')
		.setDescription('List fishing spots.')
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, fisher) {
        const user = await userDB.getUser(interaction.user.id);

        var desc = "";

        fisher.fishdata().forEach((location) => {
            desc += `- ${location.name} (requires lvl ${location.level_required})\n    > ${location.description}\n`;
        });

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Locations",
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle("Fishing Spots")
            .setDescription(desc)
            .setFooter({ text: fisher.getLocationByID(user.location).name, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [] });
	},
};