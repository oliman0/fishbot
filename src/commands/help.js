import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List commands and info.')
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, fisher) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Help",
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle("Commands")
            .setDescription(
`- fish
    > cooldown 5mins
    > Fish at the current location.

- stats *[user]*
    > View a user's stats.

- locations
    > List fishing spots and required lvl

- travel *[location]*
    > cooldown 10mins
    > Travel to a fishing location.`
            )
            .setFooter({ text: fisher.getLocationByID(user.location).name, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [] });
	},
};