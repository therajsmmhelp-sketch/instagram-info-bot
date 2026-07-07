function formatNumber(num) {

    num = Number(num || 0);

    if (num >= 1000000000)
        return (num / 1000000000).toFixed(1).replace(".0","") + "B";

    if (num >= 1000000)
        return (num / 1000000).toFixed(1).replace(".0","") + "M";

    if (num >= 1000)
        return (num / 1000).toFixed(1).replace(".0","") + "K";

    return num.toString();

}

function yesNo(v){

    return v ? "✅ Yes" : "❌ No";

}

function clean(v){

    if(v===null || v===undefined) return "Not Available";

    v=String(v);

    if(
        v==="" ||
        v.includes("Access delayed")
    ){

        return "Not Available";

    }

    return v;

}

module.exports={
    formatNumber,
    yesNo,
    clean
};
