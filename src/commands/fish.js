import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { setTimeout as wait } from "node:timers/promises";

const cooldownsecs = 300;

export const command = {
	data: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('Fish at the current location.')
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2),
	async execute(interaction, userDB, fisher) {
        if (!(await userDB.exists(interaction.user.id))) await userDB.addUser(interaction.user.id);
        var user = await userDB.getUser(interaction.user.id);

        if (Date.now() < user.last_fished+(cooldownsecs*1000)) {
            const cooldownGif = new AttachmentBuilder("./res/cooldown.gif");

            let embed = new EmbedBuilder()
            .setAuthor({
                name: "Oops",
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** try again in ${Math.floor((user.last_fished+(cooldownsecs*1000) - Date.now())/1000)} seconds 3:`)
            .setImage("attachment://cooldown.gif")
            .setFooter({ text: `Lvl${user.level}  |  ${fisher.getLocationByID(user.location).name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], files: [cooldownGif] });
            
            return;
        }

        const fishingGif = new AttachmentBuilder("./res/webfishing.gif");

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Fishing",
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** cast a line! :3`)
            .setImage("attachment://webfishing.gif")
            .setFooter({ text: `Lvl${user.level}  |  ${fisher.getLocationByID(user.location).name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [fishingGif] });

        const fish = fisher.catch(user.location);
        
        await wait(5000);

        embed = new EmbedBuilder()
            .setAuthor({
                name: "Fishing",
                iconURL: interaction.user.displayAvatarURL()})
            .setTitle(`***${interaction.user.displayName}*** caught a **${fish.tier} ${fish.name}**`)
            .setDescription(`**${fish.name}**\n> Tier:  ${fish.tier}\n> Weight:  ${fish.weight} lbs\n> Value:  ${fish.gold}`)
            .setFooter({ text: `Lvl${user.level}  |  ${fisher.getLocationByID(user.location).name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
            
        
        await interaction.editReply({ embeds: [embed], files: [] });

        await userDB.editUser(interaction.user.id, { catches: user.catches+1, gold: user.gold+fish.gold, last_fished: Date.now() });
        
        user.gold += fish.gold;
        const lvlup = await fisher.checkLevel(user, userDB);
        if (lvlup != -1) {
            embed = new EmbedBuilder()
                .setAuthor({
                    name: "Level up!!",
                    iconURL: interaction.user.displayAvatarURL()})
                .setTitle(`***${interaction.user.displayName}*** leveled up to lvl **${lvlup.level}**!`)
                .setFooter({ text: `${fisher.getLocationByID(user.location).name}`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            if (lvlup.text !== "") embed.setDescription(lvlup.text);
            
            await interaction.followUp({ embeds: [embed], files: [] });
        }
	},
};