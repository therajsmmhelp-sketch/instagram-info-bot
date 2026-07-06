function formatNumber(num) {

    num = Number(num || 0);

    if (num >= 1000000000)
        return (num / 1000000000).toFixed(1).replace(".0", "") + "B";

    if (num >= 1000000)
        return (num / 1000000).toFixed(1).replace(".0", "") + "M";

    if (num >= 1000)
        return (num / 1000).toFixed(1).replace(".0", "") + "K";

    return num.toString();

}

function yesNo(value){
    return value ? "✅ Yes" : "❌ No";
}

module.exports = {
    formatNumber,
    yesNo
};
