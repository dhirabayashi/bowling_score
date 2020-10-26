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
                scores.push(new Score());
            }
            frame.scores = scores;

            frames.push(frame);
        }
        return {
            frames: frames
        };
    },
    methods: {
        changeScore(frameIndex, selectIndex, event) {
            function canDetermineScoreAtPrevious(_this) {
                // この関数の中でthisを直接使うと想定と違うオブジェクトを指してしまうため、引数で受け取る
                return frameIndex >= 1 && selectIndex === 1
                    && _this.frames[frameIndex-1].scores[0].getStatus() === STRIKE_OCCURRED;
            }

            function canDetermineScoreAtTwoPrevious(_this) {
                return frameIndex >= 2 && selectIndex == 0
                    && _this.frames[frameIndex-2].scores[0].getStatus() === STRIKE_OCCURRED
                    && _this.frames[frameIndex-1].scores[0].getStatus() === STRIKE_OCCURRED;
            }

            let options = ['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let value = event.target.value;
            let intValue = 0;
            if(value !== '') {
                intValue = parseInt(value, 10);
            }

            // スコアの設定
            let score = this.frames[frameIndex].scores[selectIndex];
            score.add(intValue);

            // ストライク
            if(selectIndex === 0 && intValue === 10) {
                score.informStrikeOccurred();
            // スペア
            } else if(selectIndex === 1
                    && (this.frames[frameIndex].scores[selectIndex-1].intValue() + score.intValue() === 10)) {
                score.informSpareOccurred();
            } else {
                score.informScoreDetermined();
                // 一投目のプルダウンで値が選択された場合、値に応じて二投目のプルダウンの状態を変える
                if(selectIndex === 0) {
                    if(value === '') {
                        this.frames[frameIndex].selectBoxes[selectIndex+1].disabled = true;
                        this.frames[frameIndex].selectBoxes[selectIndex+1].options = options
                    } else {
                        this.frames[frameIndex].selectBoxes[selectIndex+1].disabled = false;
                        // 合計スコアが10を超えないように二投目のプルダウンで選択可能な値を絞る
                        let trancated_options = [];
                        let length = options.length - value - 1;
                        for(let i = 0; i < length; i++) {
                            trancated_options.push(i);
                        }
                        this.frames[frameIndex].selectBoxes[selectIndex+1].options = trancated_options;
                    }
                }
            }

            // 2フレーム以降は、前にストライクやスペアが起きていてスコア未確定の可能性がある
            // TODO 10フレーム目の対応
            // 一つ前のフレームのストライクのスコアを決定できる場合
            if(canDetermineScoreAtPrevious(this)) {                
                this.frames[frameIndex-1].scores[0].add(this.frames[frameIndex].scores[0].intValue() + intValue);
                this.frames[frameIndex-1].scores[0].informScoreDetermined();
                this.frames[frameIndex-1].scores[1].informScoreDetermined();                
            }

            // 二つ前のフレームのストライクのスコアを決定できる場合（ストライクが続いた場合に発生）
            if(canDetermineScoreAtTwoPrevious(this)) {                
                this.frames[frameIndex-2].scores[0].add(this.frames[frameIndex-1].scores[0].intValue() + intValue);
                this.frames[frameIndex-2].scores[0].informScoreDetermined();
                this.frames[frameIndex-2].scores[1].informScoreDetermined();                
            }

            // 一つ前のスペアのスコアを決定できる場合
            if(frameIndex >= 1 && selectIndex === 0
                    && this.frames[frameIndex-1].scores[1].getStatus() === SPARE_OCCURRED) {
                this.frames[frameIndex-1].scores[1].add(intValue);
                this.frames[frameIndex-1].scores[1].informScoreDetermined();                
            }
        
            // 完全には入力されていない場合は何も表示しない
            let scores = this.frames[frameIndex].scores.filter(function(score) {
                return score.toString() !== '';
            })
            if(scores.length !== this.frames[frameIndex].scores.length) {
                return;
            }
        },
        calcTotalScore(frameIndex) {
            let totalScore = 0;
            for(let i = 0; i <= frameIndex; i++) {
                for(let j = 0; j < this.frames[i].scores.length; j++) {
                    let score = this.frames[i].scores[j];
                    // 一つでもスコア未確定なら何も表示しない
                    if(!score.isScoreDetermined()) {
                        return '';
                    }
                    totalScore += score.intValue();
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
