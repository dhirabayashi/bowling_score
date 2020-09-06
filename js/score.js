// ヘッダー
let scoreHeader = document.getElementById("score_header");
for(let i = 1; i <= 10; i++) {
    let colspan;
    if(i == 10) {
        colspan = 3;
    } else {
        colspan = 2;
    }
    let th = document.createElement("th");
    th.colSpan = colspan;
    th.innerHTML = i;
    scoreHeader.appendChild(th);
}

// 個別のスコア
const separateId = "score_separate";
let scoreSeparate = document.getElementById(separateId);
for(let i = 1; i <= 10; i++) {
    let numOfInput;
    if(i === 10) {
        numOfInput = 3;
    } else {
        numOfInput = 2;
    }
    for(let j = 1; j <= numOfInput; j++) {
        let td = document.createElement("td");
        td.id = separateId + i + "_" + j;
        scoreSeparate.appendChild(td);    
    }
}

// スコア合計
const sumId = "score_sum";
let scoreSum = document.getElementById(sumId);
for(let i = 1; i <= 10; i++) {
    let colSpan;
    if(i === 10) {
        colSpan = 3;
    } else {
        colSpan = 2;
    }
    let td = document.createElement("td");
    td.colSpan = colSpan;
    scoreSum.appendChild(td);
}

// スコア選択プルダウン
const selectId = "score_select";
let scoreSelect = document.getElementById(selectId);
for(let i = 1; i <= 10; i++) {
    let numOfInput;
    if(i === 10) {
        numOfInput = 3;
    } else {
        numOfInput = 2;
    }

    let td = document.createElement("td");
    td.colSpan = numOfInput;

    for(let j = 1; j <= numOfInput; j++) {
        // ラベル
        let label = document.createElement("label");
        let id = selectId + i + "_" + j;
        label.for = id;
        label.innerHTML = j + "投目:";
        td.appendChild(label);
        td.appendChild(document.createElement("br"));

        // プルダウン
        let select = document.createElement("select");
        select.id = id;

        initOptions(select);

        td.appendChild(select);
        td.appendChild(document.createElement("br"));

        if(j !== 1) {
            select.disabled = true;
        }

        select.onchange = function() {
            // 1投目が選択されるまで2投目は非活性
            let select2 = document.getElementById(selectId + i + "_2");
            if(j === 1 && select.value !== "") {
                select2.disabled = false;

                // 1投目と2投目で合計10を超えないようにする
                let options = select2.children;
                removeOptions(select2);

                let empty = document.createElement("option");
                empty.value = "";
                empty.innerHTML = "";
                select2.appendChild(empty);
                let max = 10 - parseInt(select.value);
                for(let k = 0; k <= max; k++) {
                    let newOption = document.createElement("option");
                    newOption.value = k;
                    newOption.innerHTML = k;
                    select2.appendChild(newOption);
                }
            } else if(j === 1 && select.value === "") {
                select2.options[0].selected = true;
                select2.disabled = true;
                document.getElementById(separateId + i + "_2").innerHTML = "";
            }

            // テーブルに値を設定
            let score = document.getElementById(separateId + i + "_" + j);
            score.innerHTML = select.value;
        };
    }
    scoreSelect.appendChild(td);
}

function removeOptions(select) {
    let options = select.children;
    for(let i = 0, size = options.length; i < size; i++) {
        options[0].remove();
    }    
}

function initOptions(select) {
    // いったん全部消す
    removeOptions(select);

    let option = document.createElement("option");
    option.value = "";
    option.innerHTML = "";
    select.appendChild(option);

    for(let i = 0; i <= 10; i++) {
        option = document.createElement("option");
        option.value = i;
        option.innerHTML = i;
        select.appendChild(option);
    }
}
