const fs = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
	name: 'builds',
    aliases: ["build", "b"],
	description: 'Get mentor set builds for chosen god',
	execute(message, args) {
        if (args == "") { message.channel.send(new MessageEmbed().setDescription("Please Enter a God")); return;}
        getGodForBuild(message, args);
	},
};

function getGodForBuild(message, godName){
    let godFound = false;
    godName = godName.join(' ').replace(" ", "").replace("'", "").trim().toLowerCase();
    let godList = "";
    fs.readFile('gods.json', 'utf8', (err, godsData) => {
        if (err) {
            console.log("File read failed: ", err);
            return;
        }
        try {
            godList = JSON.parse(godsData);
        } catch (err) {
            console.log("Error parsing json string: ", err);
            return;
        }
        godList.forEach(god => {
            if (god.Name.replace(" ", "").replace("'", "").trim().toLowerCase() == godName){
                godFound = true;
                parseGodBuilds(god, message);
                return;
            }   
        });
        if (!godFound) {
            message.channel.send(new MessageEmbed().setDescription("God Not Found, Check Your Spelling"));
        }
    });
}

function parseGodBuilds(god, message) {
    let godBuildList = []
    fs.readFile('builds.json', 'utf8', (err, buildsData) => {
        if (err) {
            console.log("File read failed: ", err);
            return;
        }
        try {
            buildList = JSON.parse(buildsData);
        } catch (err) {
            console.log("Error parsing json string: ", err);
            return;
        }
        buildList.forEach(build => {
            if (build.god.replace(" ", "").replace("'", "").trim().toLowerCase() == god.Name.replace(" ", "").replace("'", "").trim().toLowerCase()){
                godBuildList.push(build);
            }   
        });
        if (godBuildList.length == 0) {
            message.channel.send(new MessageEmbed().setDescription("Couldnt find any builds for that god - ask a smite server mod to add one?"));
        } else {
            let embed = new MessageEmbed()
            .setTitle(`Mentor Builds for ${god.Name}`)
            .setTimestamp()
            .setFooter(`Builds From the Smite Server Mentors`)
            .setThumbnail(god.godIcon_URL);
            let buildNumber = 1;
            godBuildList.forEach(build => {
                embed.addField(`${build.role}`, `${build.items} \nID [${build.id}]`, false);
            });
            message.channel.send(embed);
        }
    });
}
