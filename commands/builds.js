const fs = require('fs');
const {MessageEmbed} = require('discord.js');
const globalFunctions = require('./globalfunctions.js');
const config = require('./auth.json');

module.exports = {
	name: 'builds',
    aliases: ["build", "b"],
	description: 'Get mentor set builds for chosen god',
	execute(message, args) {
        if (args == "") { 
            message.channel.send(new MessageEmbed().setDescription("Please Enter a God")); 
            return;
        }
        if (message.guild.id == config.smiteServerId && message.channel.id != 733765823075713111) {
            message.channel.send(new MessageEmbed().setDescription(`Build Command Only Usable in <#733765823075713111>`)); 
            return;
        }
        getGodForBuild(message, args);
	},
};

async function getGodForBuild(message, godName){
    const godObject = await globalFunctions.findObjectWithShortenedName(godName, "god")
    const god = godObject.object;
    const exactMatch = godObject.exact;
    if (god) {
        parseGodBuilds(god, message, exactMatch)
    } else {
        message.channel.send(new MessageEmbed().setDescription("God Not Found, Check Your Spelling"));
    }
}

function parseGodBuilds(god, message, exactMatch) {
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
            if (build.god.replace(/ /g, "").replace("'", "").trim().toLowerCase() == god.Name.replace(/ /g, "").replace("'", "").trim().toLowerCase()){
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
            let guideList = [];
            godBuildList.forEach(build => {
                if (build.role != "Guide") {
                    embed.addField(`${build.role}`, `${build.items} \nID [${build.id}]`, false);
                } else {
                    guideList.push(build)
                }
            });
            if (guideList.length > 0) {
                guideList.forEach(build => {
                    embed.addField(`${build.role}`, `${build.items} \nID [${build.id}]`, false);
                })
            }
            if (exactMatch) {
                message.channel.send(embed);
            } else {
                message.channel.send("Couldnt find exact match for what you entered, partial match found:", embed)
            }
        }
    });
}
