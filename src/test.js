const isGoal = (message, team) => {
    const goalRegex = /^goal_([a-zA-Z])_(\d+)$/;

// Регулярное выражение для извлечения x и y
    const match = message.match(goalRegex);

    if (match) {
        // Если сообщение соответствует шаблону "goal_x_y"
        const reg_team = match[1];
        const reg_score = parseInt(match[2], 10);
        return {win: (team === reg_team), score: reg_score}
    } else {
        return false
    }
}
let isGM = isGoal("goal_r_1", "r")
if (isGM)
    console.log("goal_r_1")
else
    console.log("sadsad")