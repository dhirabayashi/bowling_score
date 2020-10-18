new Vue({
    el: '#app',
    data() {
        let frames = [];
        for(let i = 0; i < 10; i++) {
            // 10フレームだけ3投目がありうる
            let count = i === 9 ? 3 : 2;
            let frame = {};

            // フレーム番号
            frame.num = i + 1;
            // スコア入力用プルダウン
            let selectBoxes = [];
            for(let j = 0; j < count; j++) {
                let disabled = j !== 0;
                selectBoxes.push({ options: ['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], disabled: disabled });
            }
            frame.selectBoxes = selectBoxes;

            // スコア
            let scores = [];
            for(let j = 0; j < count; j++) {
                scores.push('');
            }
            frame.scores = scores;

            frames.push(frame);
        }
        return {
            frames: frames
        };
    },
    methods: {
        changeScore(i, j, event) {
            let options = ['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let value = event.target.value;

            // スコアの設定
            // ストライク
            if(j === 0 && value === '10') {
                this.$set(this.frames[i].scores, j, 'Ｘ');
                return;
            }

            this.$set(this.frames[i].scores, j, value);

            // 一投目のプルダウンで値が選択された場合、値に応じて二投目のプルダウンの状態を変える
            if(j === 0) {
                if(value === '') {
                    this.frames[i].selectBoxes[j+1].disabled = true;
                    this.frames[i].selectBoxes[j+1].options = options
                } else {
                    this.frames[i].selectBoxes[j+1].disabled = false;
                    // 合計スコアが10を超えないように二投目のプルダウンで選択可能な値を絞る
                    let trancated_options = [];
                    let length = options.length - value - 1;
                    for(let k = 0; k < length; k++) {
                        trancated_options.push(k);
                    }
                    this.frames[i].selectBoxes[j+1].options = trancated_options;
                }
            }
        },
        calcTotalScore(i) {
            // ストライク
            //if(this.frames[i].scores[0] === 'Ｘ') {
            //}

            // 完全には入力されていない場合は何も表示しない
            let scores = this.frames[i].scores.filter(function(score) {
                return score !== '';
            })
            if(scores.length !== this.frames[i].scores.length) {
                return '';
            }

            let radix = 10;
            let totalScore = 0;
            for(let j = 0; j <= i; j++) {
                for(let k = 0; k < this.frames[j].scores.length; k++) {
                    totalScore += parseInt(this.frames[j].scores[k], radix);
                }
            }
            return totalScore;
        }
    },
    computed: {
        isDisabled: function() {
            return function(i, j) {
                return this.frames[i].selectBoxes[j].disabled;
            }
        }
    }
});
