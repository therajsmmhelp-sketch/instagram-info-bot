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

function clean(value) {

    if (value === null || value === undefined)
        return "Not Available";

    const text = String(value).trim();

    if (
        text === "" ||
        text.includes("Access delayed")
    ) {
        return "Not Available";
    }

    return text;
}

module.exports = {
    formatNumber,
    yesNo,
    clean
};

function yesNo(value){
    return value ? "✅ Yes" : "❌ No";
}

module.exports = {
    formatNumber,
    yesNo
};
